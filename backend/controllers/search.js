import express from 'express'
import {Conversation}  from '../models/Conversation.js'
import {User} from '../models/User.js'
import dotenv from 'dotenv'

dotenv.config();

export const getConversations = async (req, res) => {
    const { userId } = req.params;
    try {
        const conversations = await Conversation.find({
          participants: userId,
        }).populate('participants messages'); // Fetch participants and messages
    
        res.status(200).json(conversations);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching conversations' });
      }
};
// GET /api/conversations/:username/:targetUsername
export const getPrivateConvo = async (req, res) => {
    const { username, targetUsername } = req.params;
  
    try {
      // Find the conversation involving both users
      const conversation = await Conversation.findOne({
        participants: { $all: [username, targetUsername] }, // Ensure both users are part of the conversation
      });
      console.log(conversation)
  
      if (!conversation) {
        return res.status(404).json(null);
      }
  
      res.status(200).json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  };
  
  export const putConversations = async (req, res) => {
    const { userId, targetUserId, message } = req.body;
    console.log('Request Body:', userId, targetUserId, message);

    try {
        const updatedMessage = {
            sender: userId,
            text: message,
            timestamp: new Date(),
        };

        console.log('New Message:', updatedMessage);

        // Try to find the existing conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, targetUserId] },
        });

        if (conversation) {
            // If the conversation exists, update it with the new message
            conversation.messages.push(updatedMessage);
            await conversation.save();
            console.log('Message added to existing conversation:', updatedMessage);
        } else {
            // If no conversation exists, create a new one
            conversation = new Conversation({
                participants: [userId, targetUserId],
                messages: [updatedMessage],
            });
            await conversation.save();
            console.log('New conversation created with message:', updatedMessage);
        }

        res.json(conversation);
    } catch (error) {
        console.error('Error sending message:', error); // Log the error for debugging
        res.status(500).json({ error: 'Error sending message' });
    }
};


export const getUsers = async (req, res) => {
    const { username } = req.params;
    try {
        const regex = new RegExp(`^${username}`, 'i'); // Match usernames starting with the input (case-insensitive)
        const users = await User.find({ username: { $regex: regex } }).select('username'); // Select only usernames
        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Error searching users' });
    }
};

export const getUserProfile = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username }).select('username phone fullName email password avatar');
        res.json(user);
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Error fetching user profile' });
    }
}

export const updateUserProfile = async (req, res) => {
    const { username } = req.params;
    const { fullName, email, phone } = req.body;
    try {
        const user = await User.findOneAndUpdate({ username }, { fullName, email,phone }, { new: true });
        res.json(user);
    }
    catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Error updating user profile' });
    }
}

export const getAllProfiles = async (req, res) => {
    try {
        const users = await User.find().select('_id username fullName email avatar');
        res.json(users);
    }
    catch (error) {
        console.error('Error fetching all profiles:', error);
        res.status(500).json({ error: 'Error fetching all profiles' });
    }
}

