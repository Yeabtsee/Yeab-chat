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
    const newMessage = {
      sender: username,
      text: message.trim(),
      timestamp: new Date(),
    };
    try {
      const response = await fetch("http://localhost:5000/api/conversations", {
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
      });
      if (response.ok) {
        setMessages((prev) => [...prev, { ...newMessage, type: "sent" }]);
        setMessage("");
        if (!users.find((u) => u.username === selectedUser.username)) {
          setUsers((prev) => [...prev, { username: selectedUser.username, messages: [newMessage] }]);
        }
      } else {
        console.error("Failed to send message:", await response.text());
      }


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
          onKeyPress={handleTyping}
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