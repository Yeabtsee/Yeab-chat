import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
    participants: [{ type: String, required: true }],
    messages: [messageSchema]
});

export const Conversation = mongoose.model("Conversation", conversationSchema);
