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
export const putConversations = async (req, res) => {
    const { userId, targetUserId, message } = req.body;
    try {
        const updatedMessage = { sender: userId, text: message, timestamp: new Date() };
        console.log(userId, targetUserId, message)
        const conversation = await Conversation.findOneAndUpdate(
            { participants: { $all: [userId, targetUserId] } },
            { $push: { messages: updatedMessage } },
            { new: true, useFindAndModify: false }
        );
        console.log(conversation)
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
        else console.log('Message sent:', message); 
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
