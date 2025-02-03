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
  const [profiles, setProfiles] = useState([]);
  const [userProfile, setUserProfile] = useState({
    avatar: "",
    email: "",
    fullName: "",
  });
  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  
    // Mobile view state: if screen width <=760px, isMobile is true.
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 760);

    // Listen for resize events to update isMobile
    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth <= 760);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

  const toggleProfilePopup = () => {
    setIsProfileOpen(!isProfileOpen);
  };

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
    fetch('http://localhost:5000/api/users/profiles')
      .then((res) => res.json())
      .then((data) => setProfiles(data))
      .catch((err) => console.error('Error fetching users:', err));
  }, []);

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
    <>
     <div  className={`overlay ${isProfileOpen ? "active" : ""}`}
        onClick={toggleProfilePopup}></div>
      {/* Profile Popup */}
      {isProfileOpen && (
        <ProfilePopup
          username={username}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          onClose={handleCloseProfile}
          onLogout={onLogout}
        />
      )}
    <div className={`main-container ${isProfileOpen ? "blurred" : ""}`}>
      {/* Sidebar */}
      {(!isMobile || (isMobile && !selectedUser)) && (
      <Sidebar
        username={username}
        profiles={profiles}
        typingUser={typingUser}
        setProfiles={setProfiles}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
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
        onLogout={onLogout}

      />
      )}

      {/* Render ChatArea if not on mobile OR if mobile and conversation is selected */}
      {(!isMobile || (isMobile && selectedUser)) && (
      <ChatArea
        username={username}
        message={message}
        setMessage={setMessage}
        messages={messages}
        setMessages={setMessages}
        profiles={profiles}
        setProfiles={setProfiles}
        users={users}
        setUsers={setUsers}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        typingUser={typingUser}
        isMobile={isMobile}
      />
      )}
    </div>
    </>
  );
};

export default ChatBox;