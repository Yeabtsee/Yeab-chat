import React, { useState, useEffect } from "react";
import socket from "../socket";
import UsersList from "./UsersList";
import "../Assets/css/chatbox.css";

const ChatBox = ({ username,onLogout }) => {
  const [message, setMessage] = useState(""); // Current message
  const [messages, setMessages] = useState([]); // Chat history
  const [users, setUsers] = useState({}); // List of online users
  const [selectedUser, setSelectedUser] = useState(null); // Current selected chat user
  const [typingUser, setTypingUser] = useState(""); // Typing status

  useEffect(() => {
    // Socket listeners
    socket.on("update_users", (userList) => setUsers(userList));

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
  }, []);

  const handleSendPrivateMessage = () => {
    if (message.trim() && selectedUser) {
      socket.emit("send_private_message", {
        message,
        receiverSocketId: selectedUser,
        sender: username,
      });

      setMessages((prev) => [
        ...prev,
        { sender: "You", text: message, type: "sent" },
      ]);

      setMessage("");
    }
  };

  const handleTyping = () => {
    if (selectedUser) {
      socket.emit("start_typing", { receiverSocketId: selectedUser, senderUsername: username });
      setTimeout(() => socket.emit("stop_typing", selectedUser), 2000);
    }
  };

  return (
    <div className="main-container">
      {/* Users Sidebar */}
      <UsersList
        users={users}
        currentUser={selectedUser}
        onUserSelect={setSelectedUser}
        loggedInSocketId={socket.id}
      />

      {/* Chat Area */}
      <div className="chat-area">
        <div className="chat-header">
          <h3>
            {selectedUser
              ? `Chat with ${users[selectedUser]}`
              : "Select a user to start chatting"}
          </h3>
        </div>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {/* <span className="message-sender">{msg.sender}</span> */}
              <p className="message-text">{msg.text}</p>
            </div>
          ))}
          {typingUser && <div className="typing-status">{typingUser}</div>}
        </div>

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
