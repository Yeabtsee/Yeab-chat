import express from 'express'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js"; 
import dotenv from 'dotenv';


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



export const registerUser= async (req, res) => {
  const { username, password, email,fullName } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword,email,fullName });
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

    const isPasswordValid = await bcrypt.compare(password, user.password);

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

