import { io } from 'socket.io-client';
import API_URL from './config';

const SOCKET_URL = API_URL; // Backend server URL

const socket = io(SOCKET_URL, {
    autoConnect: false, // Connect manually when needed
});

export default socket;
