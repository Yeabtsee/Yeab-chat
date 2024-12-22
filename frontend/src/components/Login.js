import React, { useEffect, useState } from "react";
import "../Assets/css/login.css";

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
  const [isRegister, setIsRegister] = useState(false); // Toggle between login and register
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState(""); // Add fullName state
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Define API URL for login or registration
    const url = isRegister
      ? "http://localhost:5000/api/users/register"
      : "http://localhost:5000/api/users/login";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isRegister ? { username, password, email, fullName } : { username, password }
        ),
      });

      const data = await response.json();

      if (response.ok) {
        alert(isRegister ? "Registration Successful!" : "Login Successful!");
        if (!isRegister) {
          onLoginSuccess(username); // Notify App.js about successful login
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="container">
      <div className="login-container">
        <div className="circle circle-one"></div>
        <div className="form-container">
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
             placeholder="USERNAME"
             value={username}
             onChange={(e) => setUsername(e.target.value)}
             required
           />
           <input
              type="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
           <input
             type="password"
             placeholder="PASSWORD"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             required
           />
           <button className="opacity" type="submit">
              SUBMIT
            </button>
              <a href="#" onClick={() => setIsRegister(false)}>
                LOGIN
              </a>
              </>
            ):(
            <> 
            <input
             type="text"
             placeholder="USERNAME"
             value={username}
             onChange={(e) => setUsername(e.target.value)}
             required
            />
            <input
              type="password"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="opacity" type="submit">
              SUBMIT
            </button>
            <a href="#" onClick={() => setIsRegister(true)}>
              REGISTER
            </a>
            </>
          )}
            
            
          </form>
          {error && <p className="error">{error}</p>}
          <div className="register-forget opacity">
            <a href="#">Forgot Password?</a>
          </div>
        </div>
        <div className="circle circle-two"></div>
      </div>
      <div className="theme-btn-container"></div>
    </section>
  );
};

export default Login;
