import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRoute from './routes/userRoutes.js '
import {getConversations} from './controllers/search.js'
import {getUsers} from './controllers/search.js'

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT||5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = 'mongodb://localhost:27017/Users'; // Replace with your MongoDB connection string

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Increase timeout to 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Error connecting to MongoDB:', err);
});


// Create HTTP server and Socket.IO instance
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // Your frontend URL
        methods: ['GET', 'POST'],
    },
});

const users = {}; // Store online users

// Socket.IO connection
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user joining
    socket.on('user_join', (username) => {
        users[socket.id] = username;
        io.emit('update_users', users); // Broadcast updated user list
    });

    // Handle private message
    socket.on('send_private_message', (data) => {
        const { message, receiverSocketId } = data;
        io.to(receiverSocketId).emit('receive_private_message', {
            message,
            sender: users[socket.id], // Include sender's username
        });
    });


     // Handle typing events (targeted)
     socket.on('start_typing', (data) => {
        const { receiverSocketId, senderUsername } = data;
        io.to(receiverSocketId).emit('display_typing', senderUsername);
    });

    socket.on('stop_typing', (receiverSocketId) => {
        io.to(receiverSocketId).emit('hide_typing');
    });


    // Handle disconnection
    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('update_users', users); // Broadcast updated user list
        console.log(`User disconnected: ${socket.id}`);
    });
});

app.use('/api/users',usersRoute)
app.use('/api/search/:username',getUsers)
app.use('/api/conversations',getConversations)


// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
