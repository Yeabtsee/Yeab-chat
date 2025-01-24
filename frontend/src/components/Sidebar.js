import React,{useEffect} from "react";

const Sidebar = ({
  username,
  users,
  setUsers,
  selectedUser,
  setSelectedUser,
  setMessages,
  setTypingUser,
  searchedUser,
  setSearchedUser,
  searchQuery,
  setSearchQuery,
  searchResult,
  setSearchResult,
    newMessage,
}) => {
    
    useEffect(() => {
        if (newMessage?.userId) {
          console.log("Debug: newMessage received in Sidebar", newMessage);
    
          setUsers((prevUsers) =>
            prevUsers.map((user) => {
                console.log("Debug: user", user);
                console.log("Debug: newMessage.userId", newMessage.userId);
              if (newMessage.userId) { // Ensure this matches
                console.log("Debug: updating user", user.username);
                return {
                  ...user,
                  messages: [...(user.messages || []), newMessage],
                };
              }
              return user;
            })
          );
        }
      }, [newMessage, setUsers]);
      
      useEffect(() => {
        console.log("Debug: users updated in Sidebar", users);
      }, [users]);
    
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
    setTypingUser("");
    setSearchResult(null);
  };

  const handleSearchedSelectUser = async (user) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/conversations/${username}/${user.username}`
      );
      const conversation = await response.json();
      if (!conversation) {
        setSelectedUser({ username: user.username, participants: [username, user.username], messages: [] });
        setSearchResult(null);
        setMessages([]);
        }
      else{
      setSelectedUser({
        username: user.username,
        participants: [username, user.username],
        messages: Array.isArray(conversation.messages) ? conversation.messages : [],
      });
      setMessages(Array.isArray(conversation.messages) ? conversation.messages : []);
      setSearchResult(null);
    }
      setSearchedUser(null);
      setSearchQuery("");
      
    } catch (error) {
      console.error("Error selecting user from search:", error);
    }
  };

  return (
    <div className="users-sidebar">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {searchResult && searchResult.length > 0 && (
        <div className="search-results">
          {searchResult.
            filter((user) => user.username !== username).
            map((user) => (
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
        {users.map((user) => {
          const otherParticipant = user.participants?.find((p) => p !== username);
          return (
            <div
              key={user._id}
              className={`user-item ${
                selectedUser?.username === otherParticipant ? "selected" : ""
              }`}
              onClick={() => handleSelectUser(user)}
            >
              <div className="user-avatar">
                {otherParticipant?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{otherParticipant}</span>
                <br />
                {user.messages.length > 0 && (
                  <span className="latest-message">
                    {user.messages[user.messages.length - 1]?.text}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;