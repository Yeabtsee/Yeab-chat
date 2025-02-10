// ResetPassword.js
import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import "../Assets/css/login.css";

const ResetPassword = () => {
  const { token } = useParams(); // Assume your reset link includes a token in the URL
  const history = useHistory();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await response.json();
      if(response.ok) {
        setMessage('Password has been updated. Redirecting to login...');
        setTimeout(() => {
          history.push('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch(err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="container">
      <div className="login-container">
        <div className="form-container">
          <h1 className="opacity">Reset Password</h1>
          <form onSubmit={handleSubmit}>
            <input 
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input 
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

export default ResetPassword;
