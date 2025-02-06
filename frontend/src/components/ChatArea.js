import React, { useEffect,useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faPaperPlane } from '@fortawesome/free-solid-svg-icons'; // Change this line for different icons

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
      status: "sent", // Optimistic update
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
    setTimeout(() => socket.emit("stop_typing", receiverUsername), 5000); 
  }
};
useEffect(() => {
  if (selectedUser) {
    console.log("messages:", messages);
    const unseenMessages = messages.filter(
      (msg) => msg.sender !== username && msg.status === "sent"
    );
    console.log("Unseen messages:", unseenMessages);
    if (unseenMessages.length > 0) {
      unseenMessages.forEach((msg) => {
        console.log("Emitting message_seen for:", msg);
        socket.emit("message_seen", {
          sender: msg.sender,
          timestamp: msg.timestamp,
          receiver: username,
        });
      });
      // Update local state to prevent infinite emissions
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.sender !== username && msg.status === "sent"
            ? { ...msg, status: "pending" } // mark as pending
            : msg
        )
      );
     
    
    }
 
  }
}, [selectedUser,messages,username]);



// Update the status listener with proper timestamp comparison
useEffect(() => {
  const handleStatusUpdate = (data) => {
    setMessages(prev => prev.map(msg => 
      msg.timestamp === data.timestamp && 
      msg.sender === username ? 
        {...msg, status: data.status} : 
        msg
    ));
  };

  socket.on("update_message_status", handleStatusUpdate);
  return () => socket.off("update_message_status", handleStatusUpdate);
}, [username]);

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};


// Build message elements with date separators
let lastDate = null;
const messageElements = messages.map((msg, idx) => {
  const msgDate = new Date(msg.timestamp).toDateString();
  let divider = null;
  if (msgDate !== lastDate) {
    divider = (
      <div key={`divider-${idx}`} className="date-divider" style={{ textAlign: "center", margin: "10px 0", fontSize: "12px", color: "#b9bbbe" }}>
        {msgDate}
      </div>
    );
    lastDate = msgDate;
  }
  return (
    <React.Fragment key={idx}>
      {divider}
      <div
        className={`message ${msg.sender === username ? "sent" : "received"}`}
        style={{ alignSelf: msg.sender === username ? "flex-end" : "flex-start" }}
      >
        <p className="message-text" style={{ margin: "8px 0 0 0" }}>{msg.text}</p>
        <span className="message-time">
          {formatTimestamp(msg.timestamp)}
          {msg.sender === username && (
            <span className="message-status" style={{ marginLeft: "5px", fontSize: "10px", color: "#b9bbbe" }}>
              {msg.status === "seen" ? "✓✓" : "✓"}
            </span>
          )}
        </span>
      </div>
    </React.Fragment>
  );
});


  return (
    <div className="chat-area">
       <div className="chat-header">
       {isMobile && selectedUser && (
          <button
            style={{
                fontSize: "30px",
                color: "rgb(86, 109, 222)",
                marginLeft: "-5px",
                cursor: "pointer",
                alignSelf: "center", 
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "10%",
               }}
            onClick={() => setSelectedUser(null)}
          >
            <FontAwesomeIcon width="37px" icon={faChevronLeft} />
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
          <h3 style={{marginLeft:"45%"}}>Select a user</h3>
        )}
     </div>
     <div className="chat-messages">
        {messageElements}
        <div ref={chatEndRef} />
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
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </div>
  );
};

export default ChatArea;