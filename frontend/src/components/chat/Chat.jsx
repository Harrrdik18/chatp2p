import { useState, useEffect, useContext, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';
import './Chat.css';

const Chat = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
    });

    newSocket.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('userStatus', ({ userId, isOnline }) => {
      setUsers(prev => 
        prev.map(user => 
          user._id === userId ? { ...user, isOnline } : user
        )
      );
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  const searchUsers = async () => {
    try {
      const response = await axios.get(`/api/users/search?query=${searchQuery}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser) return;

    const message = {
      to: selectedUser._id,
      content: messageInput
    };

    socket.emit('sendMessage', message);
    setMessages(prev => [...prev, { ...message, from: user._id }]);
    setMessageInput('');
  };

  return (
    <div className="main-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="user-avatar">
              {user.email[0].toUpperCase()}
            </div>
            <span>{user.email}</span>
          </div>
        </div>
        <div className="search-container">
          <div className="search-box">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              placeholder="Search users..."
            />
            <button onClick={searchUsers}>🔍</button>
          </div>
        </div>
        <div className="chat-list">
          {users.map(user => (
            <div
              key={user._id}
              className={`chat-item ${selectedUser?._id === user._id ? 'selected' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="user-avatar">
                {user.email[0].toUpperCase()}
              </div>
              <div className="chat-info">
                <div className="chat-name">{user.email}</div>
                {user.isOnline && <span className="online-badge" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-area">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <div className="user-avatar">
                {selectedUser.email[0].toUpperCase()}
              </div>
              <div className="chat-info">
                <div className="chat-name">{selectedUser.email}</div>
                {selectedUser.isOnline && <span className="online-badge" />}
              </div>
            </div>
            <div className="messages-container">
              {messages
                .filter(msg => 
                  msg.from === selectedUser._id || msg.to === selectedUser._id
                )
                .map((msg, index) => (
                  <div
                    key={index}
                    className={`message ${msg.from === user._id ? 'sent' : 'received'}`}
                  >
                    {msg.content}
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="message-input-container">
              <input
                type="text"
                className="message-input"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message"
              />
              <button type="submit" className="send-button">
                ➤
              </button>
            </form>
          </>
        ) : (
          <div className="no-chat-selected">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 