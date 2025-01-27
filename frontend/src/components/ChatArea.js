import React, { useState } from "react";
import socket from "../socket";


const ChatArea = ({
  username,
  message,
  setMessage,
  messages,
  setMessages,
  users,
  setUsers,
  selectedUser,
  typingUser,
  onLogout,
}) => {
  const handleSendPrivateMessage = async () => {
    if (!message.trim() || !selectedUser?.participants) return;
    const targetUserId = selectedUser.participants.find((p) => p !== username);
    
    // Create a new message with a timestamp
    const newMessage = {
      sender: username,
      text: message.trim(),
      timestamp: new Date().toISOString(), // Use ISO string for consistency
      type: "sent",
    };
  
    try {
      // Optimistically update the sender's messages and conversations
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
  
      // Update the sender's conversations IMMEDIATELY
      setUsers((prevUsers) => {
        // Find or create the conversation
        const updatedUsers = prevUsers.map((user) => {
          if (user.participants.includes(targetUserId)) {
            return {
              ...user,
              messages: [...user.messages, newMessage],
            };
          }
          return user;
        });
  
        // If it's a new conversation, add it
        const exists = updatedUsers.some((u) => 
          u.participants.includes(targetUserId)
        );
        if (!exists) {
          updatedUsers.push({
            participants: [username, targetUserId],
            messages: [newMessage],
          });
        }
  
        // Sort by latest message (FORCE RE-RENDER)
        return [...updatedUsers].sort((a, b) => {
          const aLast = a.messages[a.messages.length - 1]?.timestamp || 0;
          const bLast = b.messages[b.messages.length - 1]?.timestamp || 0;
          return new Date(bLast) - new Date(aLast);
        });
      });
  
      // Send to server and socket
      await fetch("http://localhost:5000/api/conversations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: username,
          targetUserId,
          message: newMessage.text,
        }),
      });
      
      socket.emit("send_private_message", {
        message: newMessage.text,
        receiverUsername: targetUserId,
        sender: username,
        timestamp: newMessage.timestamp, // Pass timestamp
      });
  
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = () => {
    if (selectedUser) {
      socket.emit("start_typing", {
        receiverSocketId: selectedUser.socketId,
        senderUsername: username,
      });
      setTimeout(() => socket.emit("stop_typing", selectedUser), 2000);
    }
  };

  return (
    <div className="chat-area">
      <div className="chat-header">
        <h3>
          {selectedUser
            ? selectedUser.participants?.find((p) => p !== username) || "Select a user"
            : "Select a user"}
        </h3>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${msg.sender === username ? "sent" : "received"}`}
            style={{ alignSelf: msg.sender === username ? "flex-end" : "flex-start" }}
          >
            <p className="message-text">{msg.text}</p>
          </div>
        ))}
        {typingUser && <div className="typing-status">{typingUser}</div>}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            handleTyping();
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSendPrivateMessage();
            }
          }}
          placeholder="Type your message..."
          disabled={!selectedUser}
        />
        <button onClick={handleSendPrivateMessage} disabled={!selectedUser}>
          Send
        </button>
      </div>

      <button className="logout-button" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
};

export default ChatArea;