import React from "react";
import "../Assets/css/userslist.css";

const UsersList = ({ users, currentUser, onUserSelect, loggedInSocketId }) => {
  return (
    <div className="users-list-container">
      <h3>Online Users</h3>
      <ul className="users-list">
        {Object.entries(users).filter(([socketId]) => socketId !== loggedInSocketId).map(([socketId, username]) => (
           
          <li
            key={socketId}
            className={`user-item ${currentUser === socketId ? "active" : ""}`}
            onClick={() => onUserSelect(socketId)}
          >
            <span className="user-avatar">
              {username.charAt(0).toUpperCase()}
            </span>
            <span className="user-name">{username}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersList;
