import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import usersRoute from './routes/userRoutes.js';
import convRoute from './routes/convRoutes.js';
import { getUsers} from './controllers/search.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = 'mongodb://localhost:27017/Users'; 

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

const users = {}; // Store online users: { username: socketId }

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', (username) => {
    users[username] = socket.id; // Map username to socketId
    io.emit('update_users', users); // Broadcast updated user list
    console.log('Users after join:', users);
  });

  // Handle private message
  socket.on('send_private_message', (data) => {
    const { message, receiverUsername,sender } = data;
    const receiverSocketId = users[receiverUsername];
    console.log('Message received:', data);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_private_message', {
        message,
        sender: data.sender,
        timestamp: new Date(),

      });
      console.log('Message emitted to:', receiverSocketId);
    } else {
      console.error('Receiver not connected:', receiverUsername);
    }
  });

  // Handle typing events (targeted)
  socket.on('start_typing', (data) => {
    const { receiverUsername, senderUsername } = data;
    const receiverSocketId = users[receiverUsername];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('display_typing', senderUsername);
    }
  });

  socket.on('stop_typing', (receiverUsername) => {
    const receiverSocketId = users[receiverUsername];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('hide_typing');
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const disconnectedUser = Object.keys(users).find(
      (username) => users[username] === socket.id
    );
    if (disconnectedUser) {
      delete users[disconnectedUser];
      io.emit('update_users', users); // Broadcast updated user list
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Routes
app.use('/api/users', usersRoute);
app.use('/api/search/:username', getUsers);
app.use('/api/conversations', convRoute);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
