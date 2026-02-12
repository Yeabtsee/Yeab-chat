import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Assets/css/login.css";
import API_URL from "../config";

const themes = [
  {
    background: "#1A1A2E",
    color: "#FFFFFF",
    primaryColor: "#0F3460",
  },
  {
    background: "#461220",
    color: "#FFFFFF",
    primaryColor: "#E94560",
  },
  {
    background: "#192A51",
    color: "#FFFFFF",
    primaryColor: "#967AA1",
  },
  {
    background: "#F7B267",
    color: "#000000",
    primaryColor: "#F4845F",
  },
  {
    background: "#F25F5C",
    color: "#000000",
    primaryColor: "#642B36",
  },
  {
    background: "#231F20",
    color: "#FFF",
    primaryColor: "#BB4430",
  },
];

const setTheme = (theme) => {
  const root = document.querySelector(":root");
  root.style.setProperty("--background", theme.background);
  root.style.setProperty("--color", theme.color);
  root.style.setProperty("--primary-color", theme.primaryColor);
};

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const query = new URLSearchParams(window.location.search);
  const mode = query.get("mode");
  const [isRegister, setIsRegister] = useState(mode === "register");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetStage, setResetStage] = useState("initial"); // initial, email-sent, reset-form
  const [resetEmail, setResetEmail] = useState("");
  const [resetData, setResetData] = useState({
    token: "",
    password: "",
    confirmPassword: "",
  });

  // Handle theme buttons
  useEffect(() => {
    const btnContainer = document.querySelector(".theme-btn-container");
    themes.forEach((theme) => {
      const div = document.createElement("div");
      div.className = "theme-btn";
      div.style.cssText = `background: ${theme.background}; width: 25px; height: 25px`;
      btnContainer.appendChild(div);
      div.addEventListener("click", () => setTheme(theme));
    });
  }, []);

  // Handle password reset token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    console.log("Token:",token);
    if (token) {
      setResetData((prev) => ({ ...prev, token }));
      setResetStage("reset-form");
    }
  }, []);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        setResetStage("email-sent");
        setError("");
      } else {
        setError(data.message || "Failed to send reset email");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (resetData.password !== resetData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: resetData.token,
          password: resetData.password,
          confirmPassword: resetData.confirmPassword,
        }),
      });


      const data = await response.json();
      if (response.ok) {
        alert("Password updated successfully! Please login with your new password.");
        window.location.href = "/login";
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegister
      ? `${API_URL}/api/users/register`
      : `${API_URL}/api/users/login`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister ? { username, password, phone, email, fullName } : { username, password }
        ),
      });

      const data = await response.json();
      if (response.ok) {
        if (isRegister) {
          // Auto-login after registration
          const loginResponse = await fetch(`${API_URL}/api/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });

          if (loginResponse.ok) {
            alert("Registration Successful! Logged in automatically.");
            onLoginSuccess(username);
             
          } else {
            setError("Registration successful, but login failed. Please try logging in.");
          }
        } else {
          alert("Login Successful!");
          onLoginSuccess(username);
        
        }
      } else {
        setError(data.message || "Failed to process request");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  const renderResetForm = () => {
    switch (resetStage) {
      case "email-sent":
        return (
          <div className="reset-message">
            <h2>Check Your Email</h2>
            <p>We've sent instructions to {resetEmail}</p>
            <button onClick={() => setResetStage("initial")}>Back to Login</button>
          </div>
        );

      case "reset-form":
        return (
          <form onSubmit={handlePasswordReset} className="reset-form">
            <input
              type="password"
              placeholder="New Password"
              value={resetData.password}
              onChange={(e) =>
                setResetData({ ...resetData, password: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={resetData.confirmPassword}
              onChange={(e) =>
                setResetData({ ...resetData, confirmPassword: e.target.value })
              }
              required
            />
            <button type="submit">Reset Password</button>
            <a href="/login">Back to Login</a>
          </form>
        );

      default:
        return (
          <form onSubmit={handleForgotPassword} className="reset-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
            <button type="submit">Send Reset Link</button>
            <a href="#" onClick={() => setResetStage("initial")}>
              Back to Login
            </a>
          </form>
        );
    }
  };

  return (
    <section className="container">
      <div className="login-container">
        <div className="circle circle-one"></div>
        <div className="form-container">
          

          {resetStage !== "initial" ? (
            
            <div className="reset-container">
              <h1>Reset Password</h1>
              {renderResetForm()}
              
            </div>
          ) : (
            <>
              <img
              src="/images/illustration.png"
              alt="illustration"
              className="illustration"
            />
              <h1 className="opacity">{isRegister ? "REGISTER" : "LOGIN"}</h1>
              <form onSubmit={handleSubmit}>
                {isRegister ? (
                  <>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </>
                )}
                <button type="submit">{isRegister ? "Register" : "Login"}</button>
              </form>
              <div className="toggle-actions">
                <a href="#" className="register-forget" onClick={() => setIsRegister(!isRegister)}>
                  {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
                </a>
              
                {!isRegister && (
                  <a href="#" className="register-forget opacity" onClick={() => setResetStage("forgot-password")}>
                    Forgot Password?
                  </a>
                )}
              </div>
            </>
          )}
          {error && <p className="error">{error}</p>}

        </div>
        <div className="circle circle-two"></div>
      </div>
      <div className="theme-btn-container"></div>
    </section>
  );
};

export default Login;