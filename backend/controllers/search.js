import express from 'express'
import {Conversation}  from '../models/Conversation.js'
import {User} from '../models/User.js'
import dotenv from 'dotenv'

dotenv.config();

export const getConversations = async (req, res) => {
    const { userId, targetUserId } = req.body;
    try {
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, targetUserId] }
        });
        if (!conversation) {
            conversation = new Conversation({ participants: [userId, targetUserId], messages: [] });
            await conversation.save();
        }
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: 'Error creating/fetching conversation' });
    }
};

export const getUsers = async (req, res) => {
    const { username } = req.params;
    try {
        const foundUser = await User.findOne({ username });
        console.log(foundUser)
        if (!foundUser) return res.status(404).json({ message: 'User not found' });
        res.json(foundUser);
    } catch (error) {
        res.status(500).json({ error: 'Error searching user' });
    }

};