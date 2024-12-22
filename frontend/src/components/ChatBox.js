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
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Track if profile popup is open
  const [userProfile, setUserProfile] = useState({
    avatar: "",
    email: "",
    fullName: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/${username}`);
        const profileData = await response.json();
        setUserProfile(profileData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
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

   socket.on('receive_private_message', (data) => {
      console.log('Message Received from Socket:', data); // Debugging
      if (selectedUser && selectedUser.participants.includes(data.sender)) {
        setMessages((prev) => [
          ...prev,
          { sender: data.sender, text: data.message, type: 'received' },
        ]);
      }
    });

    socket.on("display_typing", (senderUsername) => {
      setTypingUser(`${senderUsername} is typing...`);
    });

    socket.on("hide_typing", () => setTypingUser(""));

    return () => {
      socket.off("receive_private_message");
      socket.off("display_typing");
      socket.off("hide_typing");
    };
  }, [username]);

  const handleProfileClick = () => {
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
  };

  const handleProfileUpdate = async (updatedProfile) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${username}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUserProfile(updatedData);
        alert("Profile updated successfully!");
        setIsProfileOpen(false);
      } else {
        console.error("Failed to update profile:", await response.text());
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };


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
    setSelectedUser(user);
    setMessages(user.messages || []);
    setTypingUser(null);
    console.log("Selected User:", user);
  };

  const handleSearchedSelectUser = async (user) => {
    try {
      console.log(username)
      const response = await fetch(`http://localhost:5000/api/conversations/${username}`);
      const conversation = await response.json();
      console.log("convo: ",conversation)
      setSelectedUser(user);
      setMessages(Array.isArray(conversation.messages) ? conversation.messages : []);
    } catch (error) {
      console.error("Error selecting user:", error);
    }
  };

  const handleSendPrivateMessage = async () => {
    if (message.trim() && selectedUser) {
      const newMessage = {
        sender: username,
        text: message.trim(),
        timestamp: new Date(),
      };

      try {
        const response = await fetch("http://localhost:5000/api/conversations", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: username,
            targetUserId: selectedUser.participants.find((participant) => participant !== username),
            message: newMessage.text,
          }),
        });

        if (response.ok) {
          // Display the sent message immediately
          setMessages((prevMessages) => [
            ...prevMessages,
            { ...newMessage, type: "sent" },
          ]);

          setMessage("");
        } else {
          console.error("Failed to send the message:", await response.text());
        }
        console.log("Selected User During Send:", selectedUser);

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
      {/* User Avatar */}
      <div className="user-avatar-container" onClick={handleProfileClick}>
        <img
          src={userProfile.avatar || "default-avatar.png"}
          alt="U"
          className="user-avatar"
        />
      </div>

      {/* Profile Popup */}
      {isProfileOpen && (
        <div className="profile-popup">
          <div className="profile-content">
            <h2>User Profile</h2>
            <img
              src={userProfile.avatar || "default-avatar.png"}
              alt= "U"
              className="profile-avatar"
            />
            <label>
              Full Name:
              <input
                type="text"
                value={userProfile.fullName}
                onChange={(e) =>
                  setUserProfile((prev) => ({ ...prev, fullName: e.target.value }))
                }
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                value={userProfile.email}
                onChange={(e) =>
                  setUserProfile((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </label>
            <button
              onClick={() => handleProfileUpdate(userProfile)}
            >
              Save Changes
            </button>
            <button onClick={handleCloseProfile}>Close</button>
          </div>
        </div>
      )}

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
                onClick={() => handleSearchedSelectUser(user)}
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
                  <br />
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
              ? selectedUser.participants.find(
                  (participant) => participant !== username
                )
              : "Select a user to start chatting"}
          </h3>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.sender === username ? "sent" : "received"
              }`}
              style={{
                alignSelf: msg.sender === username ? "flex-end" : "flex-start",
              }}
            >
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
