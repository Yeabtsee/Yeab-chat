import express from 'express'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js"; 
import dotenv from 'dotenv';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';
import { resetPasswordEmail } from '../utils/emailTemplate.js';


dotenv.config();

// Endpoint to upload avatar
export const updateAvatar = async (req, res) => {
  const { username } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Construct avatar URL
  const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;

  try {
    // Find the user and update the avatar field
    const user = await User.findOneAndUpdate(
      { username }, // Query to find the user by username
      { avatar: avatarUrl }, // Update the avatar field
      { new: true } // Return the updated user
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ avatarUrl });
  } catch (error) {
    console.error("Error updating avatar:", error);
    return res.status(500).json({ error: "Failed to update avatar" });
  }
};

export const registerUser = async (req, res) => {
  const { username, password, phone, email, fullName } = req.body;

  // Validate required fields
  if (!username || !password || !phone || !email || !fullName) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Email validation using a simple regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  // Password validation: minimum 8 characters, at least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      message: "Password must be at least 8 characters long and contain at least one letter and one number." 
    });
  }

  // Phone number validation: allow digits only, length between 10 and 15
  const phoneRegex = /^\d{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      username, 
      password: hashedPassword, 
      email, 
      fullName, 
      phone 
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(400).json({ message: "Registration failed" });
  }
};


export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(user, password)

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(isPasswordValid)

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    const JWT = process.env.JWT_SECRET||"Dinbi"
    const token = jwt.sign({ id: user._id }, JWT , {
      expiresIn: "1h",
    });
    

    res.json({ token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// Add to your existing routes
export const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
 
    const user = await User.findOne({ email });

    
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    // Generate reset token (simple example)
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetToken = crypto
                  .createHash('sha256')
                  .update(resetToken)
                  .digest('hex');              

    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/login?token=${resetToken}`;
    
    // Send email
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message: resetPasswordEmail(resetUrl)
    });

    res.status(200).json({ message: "Reset link sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const ResetPassword = async (req, res) => {
  try {
    console.log(req.body)
    const hashedToken = crypto
    .createHash('sha256')
    .update(req.body.token)
    .digest('hex');

    console.log(hashedToken)
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() }
    });

    console.log(user)

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }


    user.password = await bcrypt.hash(req.body.password, 10);


    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
