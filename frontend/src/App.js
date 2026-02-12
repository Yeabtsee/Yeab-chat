import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import socket from "./socket";
import Login from "./components/Login";
import ChatBox from "./components/ChatBox";
import LandingPage from "./components/LandingPage";
import "./App.css";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  // Check local storage on app load
  useEffect(() => {
    const storedUsername = localStorage.getItem("chat");
    if (storedUsername) {
      setUsername(storedUsername);
      setIsLoggedIn(true);
      socket.connect();
      socket.emit("user_join", storedUsername);
    }
  }, []);

  const handleLoginSuccess = (username) => {
    setUsername(username);
    setIsLoggedIn(true);
    localStorage.setItem("chat", username); // Save username in local storage
    socket.connect();
    socket.emit("user_join", username);
    // Set a timeout to remove the saved item in local storage after 2 hours
    setTimeout(() => {
      localStorage.removeItem("chat");
      setIsLoggedIn(false);
      setUsername("");
      socket.disconnect();
    }, 2 * 60 * 60 * 1000); // 2 hours in milliseconds
  };

  const handleLogout = () => {
    localStorage.removeItem("chat");
    setIsLoggedIn(false);
    setUsername("");
    socket.disconnect();
  };

  return (
    <Router>
      <Routes>
        {/* Root route renders LandingPage */}
        <Route path="/" element={<LandingPage />} />

        {/* Explicit login route */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/chat" />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />


        {/* Chat route */}
        <Route
          path="/chat"
          element={
            isLoggedIn ? (
              <ChatBox username={username} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Wildcard route - preserve query parameters when redirecting */}
        <Route path="*" element={<Navigate to={`/login${window.location.search}`} />} />
      </Routes>
    </Router>
  );
};

export default App;
