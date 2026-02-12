import React, { useEffect, useState } from "react";
import socket from "../socket";
import API_URL from "../config";

const Sidebar = ({
  username,
  users,
  setUsers,
  selectedUser,
  onlineUsers,
  userProfile,
  profiles,
  setIsProfileOpen,
  setUnreadCounts,
  setSelectedUser,
  setMessages,
  setTypingUser,
  unreadCounts,
  setSearchedUser,
  searchQuery,
  setSearchQuery,
  searchResult,
  setSearchResult,
  newMessage,
  typingUser,
}) => {
  // Initialize unreadCounts from localStorage if available

  // Persist unreadCounts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("unreadCounts", JSON.stringify(unreadCounts));
  }, [unreadCounts]);

  useEffect(() => {
    if (newMessage?.sender && newMessage.timestamp) {
      setUsers((prevUsers) => {
        // Update user's messages
        const updatedUsers = prevUsers.map((user) => {
          if (user.participants?.includes(newMessage.sender)) {
            return {
              ...user,
              messages: [...(user.messages || []), newMessage],
            };
          }
          return user;
        });

        // Create a new array before sorting to ensure reference change
        const sortedUsers = [...updatedUsers].sort((a, b) => {
          const aLast = a.messages?.[a.messages.length - 1]?.timestamp || 0;
          const bLast = b.messages?.[b.messages.length - 1]?.timestamp || 0;
          return new Date(bLast) - new Date(aLast);
        });

        return sortedUsers;
      });
    }
  }, [newMessage, setUsers]);

  useEffect(() => {
    // Sort users whenever the users array changes
    const sortedUsers = [...users].sort((a, b) => {
      const aLast = a.messages?.[a.messages.length - 1]?.timestamp || 0;
      const bLast = b.messages?.[b.messages.length - 1]?.timestamp || 0;
      return new Date(bLast) - new Date(aLast);
    });

    // Update state only if the order changed
    if (JSON.stringify(sortedUsers) !== JSON.stringify(users)) {
      setUsers(sortedUsers);
    }
  }, [users]); // Trigger when `users` changes

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResult(null);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/search/${query}`);
      const result = await response.json();
      setSearchResult(result);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResult(null);
    }
  };

  const resetUnreadCount = (username) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [username]: 0,
    }));
  };

  const handleSelectUser = (user) => {
    const sender = user.participants.find((p) => p !== username);
    resetUnreadCount(sender);
    setSelectedUser(user);
    setMessages(user.messages || []);
    setTypingUser("");
    setSearchResult(null);

    // Emit message_seen for all unseen messages
    const unseenMessages = user.messages.filter(
      (msg) => msg.sender !== username && msg.status === "sent"
    );
    unseenMessages.forEach((msg) => {
      socket.emit("message_seen", {
        sender: msg.sender,
        timestamp: msg.timestamp,
        receiver: username,
      });
    });
  };

  const handleSearchedSelectUser = async (user) => {
    try {
      const response = await fetch(
        `${API_URL}/api/conversations/${username}/${user.username}`
      );
      const conversation = await response.json();
      resetUnreadCount(user.username);
      if (!conversation) {
        setSelectedUser({
          username: user.username,
          participants: [username, user.username],
          messages: [],
        });
        setSearchResult(null);
        setMessages([]);
      } else {
        setSelectedUser({
          username: user.username,
          participants: [username, user.username],
          messages: Array.isArray(conversation.messages)
            ? conversation.messages
            : [],
        });
        setMessages(
          Array.isArray(conversation.messages) ? conversation.messages : []
        );
        setSearchResult(null);
      }
      setSearchedUser(null);
      setSearchQuery("");
    } catch (error) {
      console.error("Error selecting user from search:", error);
    }
  };
  const handleProfileClick = () => setIsProfileOpen(true);
  const handleCloseProfile = () => setIsProfileOpen(false);

  return (
    <div className="users-sidebar">
      <div className="profile-container">
        <div className="user-avatar-container" onClick={handleProfileClick}>
          {userProfile.avatar ? (
            <img
              src={userProfile.avatar}
              alt=""
              className="profile-avatar"
              onError={(e) => {
                console.error(
                  "Debug: Avatar image failed to load:",
                  userProfile.avatar
                );
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

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>
      {searchResult && searchResult.length > 0 && (
        <div className="search-results">
          {searchResult
            .filter((user) => user.username !== username)
            .map((user) => (
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

      <div className="users-list">
        {users.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              fontSize: "25px",
              color: "rgb(83, 79, 79)",
            }}
          >
            No chats Yet!
            <br /> Please search for a user!
          </p>
        ) : (
          users.map((user) => {
            const otherParticipant = user.participants?.find(
              (p) => p !== username
            );
            const unread = unreadCounts[otherParticipant] || 0;
            const isOnline = onlineUsers[otherParticipant]; // Check if user is online
            return (
              <div
                key={user._id}
                className={`user-item ${
                  selectedUser?.participants?.includes(otherParticipant)
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleSelectUser(user)}
              >
                {profiles.map((profile) => {
                  if (profile.username === otherParticipant) {
                    return (
                      <div className="avatar-container" key={profile.username}>
                        {profile.avatar ? (
                          <img
                            className="profile-avatar"
                            src={profile.avatar}
                            alt=""
                          />
                        ) : (
                          <span className="profile-avatar-letter">
                            {otherParticipant[0].toUpperCase()}
                          </span>
                        )}
                        {/* Online status indicator */}
                        <span
                          className={`status-indicator ${
                            isOnline ? "online" : "offline"
                          }`}
                        ></span>
                      </div>
                    );
                  }
                  return null;
                })}
                <div className="user-info">
                  <span className="user-name">{otherParticipant}</span>
                  <br />
                  {user.messages.length > 0 && (
                    <span className="latest-message">
                      {typingUser.split(" ")[0] === otherParticipant
                        ? "Typing..."
                        : user.messages[user.messages.length - 1]?.text}
                      {user.messages[user.messages.length - 1].text === ""
                        ? "📷 photo"
                        : ""}
                    </span>
                  )}
                </div>
                {unread > 0 && <span className="unread-badge">{unread}</span>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
