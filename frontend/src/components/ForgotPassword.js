// ForgotPassword.js
import React, { useState } from 'react';
import "../Assets/css/login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if(response.ok) {
        setMessage('Password reset link has been sent to your email.');
      } else {
        setError(data.message || 'Failed to send reset link.');
      }
    } catch(err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="container">
      <div className="login-container">
        <div className="form-container">
          <h1 className="opacity">Forgot Password</h1>
          <form onSubmit={handleSubmit}>
            <input 
              type="email"
              placeholder="EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="opacity" type="submit">
              SUBMIT
            </button>
          </form>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
          <div className="register-forget opacity">
            <a href="/login">Back to Login</a>
          </div>
        </div>
      </div>
      <div className="theme-btn-container"></div>
    </section>
  );
};

export default ForgotPassword;
