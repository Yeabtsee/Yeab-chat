import React, { useState, useEffect } from "react";
import socket from "../socket";
import ProfilePopup from "./ProfilePopup";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import "../Assets/css/chatbox.css";

const ChatBox = ({ username, onLogout }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchedUser, setSearchedUser] = useState(null);
  const [typingUser, setTypingUser] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    avatar: "",
    email: "",
    fullName: "",
  });
  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});

  // Fetch data & set up socket listeners
  useEffect(()=>{
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
  },[username])

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/conversations/${username}`);
        const result = await response.json();
        setUsers(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    fetchConversations();

    socket.on("receive_private_message", (data) => {
        const sender = data.sender;
        // Only increment if not viewing the conversation
        if (!selectedUser?.participants?.includes(sender)) {
          setUnreadCounts(prev => ({
            ...prev,
            [sender]: (prev[sender] || 0) + 1
          }));
        }

        if (selectedUser?.participants?.includes(data.sender)) {
          setMessages((prev) => [...prev,
            { 
              sender: data.sender,
              text: data.message,
              type: "received",
              timestamp: data.timestamp,
            }]);
            }
        // Update newMessage so Sidebar can see it
        setNewMessage({
          userId: data.sender, 
          text: data.message,
          timestamp: data.timestamp,
        });
      });

      socket.on('update_users', (users) => {
        setOnlineUsers(users);
      });  
    socket.on("display_typing", (senderUsername) => setTypingUser(`${senderUsername} is typing...`));
    socket.on("hide_typing", () => setTypingUser(""));

    return () => {
      socket.off("receive_private_message");
      socket.off('update_users');
      socket.off("display_typing");
      socket.off("hide_typing");
    };
  }, [username, selectedUser]);


  // Profile popup toggles
  const handleProfileClick = () => setIsProfileOpen(true);
  const handleCloseProfile = () => setIsProfileOpen(false);

  return (
    <div className="main-container">
      {/* Avatar trigger for profile popup */}
      <div className="user-avatar-container" onClick={handleProfileClick}>
      {userProfile.avatar ? (
        <img
          src={userProfile.avatar}
          alt=""
          className="profile-avatar"
          onError={(e) => {
            console.error("Debug: Avatar image failed to load:", userProfile.avatar);
            e.target.src = ""; // Optionally set a default image
          }}
        />
        
      ) : (
        <div
          className="profile-avatar-letter"
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            border: "1px solid #fff",
            backgroundColor: "rgb(61, 117, 239)",
            color: "#fff",
            textAlign: "center",
            lineHeight: "50px",
            fontSize: "1.5rem",
          }}
        >
          {username?.charAt(0).toUpperCase()}
       </div>
      )}
      </div>

      {/* Profile Popup */}
      {isProfileOpen && (
        <ProfilePopup
          username={username}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          onClose={handleCloseProfile}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        username={username}
        onlineUsers={onlineUsers}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        unreadCounts={unreadCounts}
        setUnreadCounts={setUnreadCounts}
        users={users}
        setUsers={setUsers}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        setMessages={setMessages}
        setTypingUser={setTypingUser}
        searchedUser={searchedUser}
        setSearchedUser={setSearchedUser}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResult={searchResult}
        setSearchResult={setSearchResult}
        newMessage={newMessage}

      />

      {/* Chat Area */}
      <ChatArea
        username={username}
        message={message}
        setMessage={setMessage}
        messages={messages}
        setMessages={setMessages}
        users={users}
        setUsers={setUsers}
        selectedUser={selectedUser}
        typingUser={typingUser}
        onLogout={onLogout}
      />
    </div>
  );
};

export default ChatBox;