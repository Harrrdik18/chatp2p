require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const SocketService = require('./services/socketService');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const messageRoutes = require('./routes/messages');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

new SocketService(io);

connectDB();
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 