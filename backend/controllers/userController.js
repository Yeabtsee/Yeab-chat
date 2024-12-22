import express from 'express'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import { User } from "../models/User.js"; // Adjust the path to your User model
import dotenv from 'dotenv';


dotenv.config();

// Multer setup for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars'); // Directory to store profile pictures
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });



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

