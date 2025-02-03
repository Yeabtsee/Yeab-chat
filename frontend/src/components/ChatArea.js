import React, { useEffect,useRef } from "react";

import socket from "../socket";


const ChatArea = ({
  username,
  message,
  setMessage,
  messages,
  setMessages,
  profiles,
  setUsers,
  selectedUser,
  setSelectedUser,
  typingUser,
  isMobile,
}) => {
  const chatEndRef = useRef(null);

  // Function to scroll to the last message
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Trigger scrolling whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
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

  // In the handleTyping function
const handleTyping = () => {
  if (selectedUser) {
    const receiverUsername = selectedUser.participants.find((p) => p !== username);

    socket.emit("start_typing", {
      receiverUsername,
      senderUsername: username,
    });
    setTimeout(() => socket.emit("stop_typing", receiverUsername), 5000); // Stop typing after 2 seconds
  }
};

  return (
    <div className="chat-area">
       <div className="chat-header">
       {isMobile && selectedUser && (
          <button
            style={{
                fontSize: "30px",
                color: "white",
                marginRight: "10px",
                cursor: "pointer",
                alignSelf: "center", 
                backgroundColor: "rgb(86, 109, 222) ",
                border: "none",
                borderRadius: "10%",
               }}
            onClick={() => setSelectedUser(null)}
          >
            &lt; 
          </button>
        )}
        {selectedUser ? (
          <>
          <div style={{display:"flex",flexDirection:"column",marginLeft: isMobile ? "0" : "45%" }}>
            <h3 className="username" style={{marginBottom:"2px"}}>
              {selectedUser.participants.find((p) => p !== username)}
            </h3>
            {
            typingUser.split(" ")[0] === selectedUser.participants.find((p) => p !== username) ? 
              <p
                style={{
                  alignSelf: "center",
                  fontSize: "12px",
                  color: "#999",
                  marginTop: "0px",
                }}
              >
                Typing...
              </p>
              : null}
            </div>
            {profiles.find((profile) =>
                  profile.username === selectedUser.participants.find((p) => p !== username)
                )?.avatar ? (
                  <img
              src={
                profiles.find((profile) =>
                  profile.username === selectedUser.participants.find((p) => p !== username)
                )?.avatar
              }
              alt="User Avatar"
              className="user-avatar"
            /> 
            ) : (
              <span className="user-avatar">
                {selectedUser.participants.find((p) => p !== username)[0].toUpperCase()}
              </span>
            )
              
            }
            
          </>
        ) : (
          <h3>Select a user</h3>
        )}
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
        
        <div ref={chatEndRef} /> {/* Scroll here */} 
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
    </div>
  );
};

export default ChatArea;