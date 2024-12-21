import React from "react";
import "../Assets/css/userslist.css";

const UsersList = ({ users, selectedUser }) => {
  return (
    <div className="users-list">
      {selectedUser && (
        <div className="user">
          {selectedUser.username}
        </div>
      )}
      {Object.keys(users).map((user) => (
        <div key={user} className="user">
          {user.username}
        </div>
      ))}
    </div>
  );
};

export default UsersList;
