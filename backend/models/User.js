// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, unique: true },
  fullName: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String },
});

export const User = mongoose.model('User', userSchema);
