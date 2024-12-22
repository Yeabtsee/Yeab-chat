// Combined ChatBox.js and UsersList.js
import React, { useState, useEffect } from "react";
import socket from "../socket";
import "../Assets/css/chatbox.css";

const ChatBox = ({ username, onLogout }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [typingUser, setTypingUser] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/conversations/${username}`
        );
        const result = await response.json();
        setUsers(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();

    socket.on("receive_private_message", (data) => {
      setMessages((prev) => [
        ...prev,
        { sender: data.sender, text: data.message, type: "received" },
      ]);
    });

    socket.on("display_typing", (senderUsername) => {
      setTypingUser(`${senderUsername} is typing...`);
    });

    socket.on("hide_typing", () => setTypingUser(""));

    return () => {
      socket.off("update_users");
      socket.off("receive_private_message");
      socket.off("display_typing");
      socket.off("hide_typing");
    };
  }, [username]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResult(null);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/search/${query}`);
      const result = await response.json();
      setSearchResult(result);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResult(null);
    }
  };

  const handleSelectUser = (user) => {
    // Update the selected user state
    setSelectedUser(user);
  
    // Update the messages state with the selected user's chat history
    setMessages(user.messages || []);
  
    // Optional: Clear any typing indicator when switching users
    setTypingUser(null);
  
    console.log("Selected User:", user); // Debug: Log the selected user
  };

  const handleSendPrivateMessage = async () => {
    if (message.trim() && selectedUser) {
      const newMessage = {
        sender: username,
        text: message,
        timestamp: new Date(),
      };

      try {
        await fetch("http://localhost:5000/api/conversations", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: username,
            targetUserId: selectedUser.username,
            message: newMessage.text,
          }),
        });
        setMessages((prev) => [
          ...prev,
          { sender: "You", text: message, type: "sent" },
        ]);

        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
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
    <div className="main-container">
  {/* Sidebar */}
  <div className="users-sidebar">
    {/* Search Bar */}
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>

    {/* Search Results */}
    {searchResult && searchResult.length > 0 && (
      <div className="search-results">
        {searchResult.map((user) => (
          <div
            key={user.username}
            className="search-item"
            onClick={() => handleSelectUser(user)}
          >
            {user.username}
          </div>
        ))}
      </div>
    )}

    {/* Users List */}
    <div className="users-list">
      {Array.isArray(users) &&
        users.map((user) => (
          <div
            key={user._id}
            className={`user-item ${
              selectedUser?.username ===
              user.participants.find((participant) => participant !== username)
                ? "selected"
                : ""
            }`}
            onClick={() => handleSelectUser(user)}
          >
            <div className="user-avatar">
              {user.participants
                .find((participant) => participant !== username)
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">
                {user.participants.find(
                  (participant) => participant !== username
                )}
              </span>
              <br/>
              {user.messages.length > 0 && (
                <span className="latest-message">
                  {user.messages[user.messages.length - 1].text}
                </span>
              )}
            </div>
          </div>
        ))}
    </div>
  </div>

  {/* Chat Area */}
  <div className="chat-area">
    {/* Chat Header */}
    <div className="chat-header">
  <h3>
    {selectedUser
      ? `${
          selectedUser.participants.find(
            (participant) => participant !== username
          )
        }`
      : "Select a user to start chatting"}
  </h3>
</div>


    {/* Chat Messages */}
    <div className="chat-messages">
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.type}`}>
          <span className="message-sender">{msg.sender}</span>
          <p className="message-text">{msg.text}</p>
        </div>
      ))}
      {typingUser && <div className="typing-status">{typingUser}</div>}
    </div>


    {/* Chat Input */}
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
  </div>

  {/* Logout Button */}
  <button className="logout-button" onClick={onLogout}>
    Logout
  </button>
</div>

  );
};

export default ChatBox;
