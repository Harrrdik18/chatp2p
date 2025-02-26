const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

class SocketService {
  constructor(io) {
    this.io = io;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', async (socket) => {
      const userId = socket.user._id;

      // Update user's online status and socket ID
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        socketId: socket.id
      });

      // Broadcast user's online status
      this.io.emit('userStatus', { userId, isOnline: true });

      // Handle private messages
      socket.on('sendMessage', async (data) => {
        try {
          const { to, content } = data;
          const message = new Message({
            sender: userId,
            receiver: to,
            content
          });
          await message.save();

          const receiverSocket = await this.getUserSocket(to);
          if (receiverSocket) {
            // User is online, send message directly
            this.io.to(receiverSocket).emit('message', {
              from: userId,
              content
            });
            message.delivered = true;
            await message.save();
          } else {
            // User is offline, store message
            await User.findByIdAndUpdate(to, {
              $push: {
                pendingMessages: {
                  from: userId,
                  content
                }
              }
            });
          }
        } catch (error) {
          console.error('Error sending message:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', async () => {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          socketId: null
        });
        this.io.emit('userStatus', { userId, isOnline: false });
      });
    });
  }

  async getUserSocket(userId) {
    const user = await User.findById(userId);
    return user?.socketId;
  }
}

module.exports = SocketService; 