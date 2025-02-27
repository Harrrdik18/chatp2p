import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import axios from '../../utils/axios';

const Chat = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const [showProfile, setShowProfile] = useState(true);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Connect to WebSocket
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
        prev.map(u => u._id === userId ? { ...u, isOnline } : u)
      );
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // Update search handler to use debounce
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`/api/users/search${searchQuery ? `?query=${searchQuery}` : ''}`);
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [searchQuery]); // Will fetch when search query changes

  // Fetch chat history when selecting a user
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!selectedUser) return;
      
      try {
        const response = await axios.get(`/api/messages/${selectedUser.id}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
  }, [selectedUser]);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`/api/users/search?query=${searchQuery}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser || !socket) return;

    const messageData = {
      to: selectedUser.id,
      content: messageInput
    };

    socket.emit('sendMessage', messageData);
    
    // Optimistically add message to UI
    setMessages(prev => [...prev, {
      ...messageData,
      from: user._id,
      timestamp: new Date().toISOString()
    }]);
    
    setMessageInput('');
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="flex h-screen bg-white">
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-1 mb-5">
            <img src="/mchat.png" alt="Mchat" className="h-8" />
          </div>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-md bg-gray-100 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map(user => {
            return (
              <div 
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`flex p-3 gap-3 cursor-pointer hover:bg-gray-50 ${
                  selectedUser?.id === user.id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                    {getInitials(user.name)}
                  </div>
                  {/* Online status indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    user.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 truncate">
                      {user.lastMessage || user.email}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                  {getInitials(selectedUser.name)}
                </div>
                <span className="font-medium">{selectedUser.name}</span>
              </div>
              <button className="text-2xl text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
              <div className="flex flex-col gap-2">
                {messages.map((message, index) => (
                  <div 
                    key={index}
                    className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                      message.from === user._id 
                        ? 'bg-indigo-50 self-end' 
                        : 'bg-white'
                    }`}
                  >
                    <p className="text-gray-900">{message.content}</p>
                    {console.log(message)}
                    <span className="text-xs text-gray-500 block text-right mt-1">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 flex gap-3">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message"
                className="flex-1 p-2 border border-gray-200 rounded-md focus:outline-none focus:border-indigo-500"
              />
              <button 
                type="submit"
                disabled={!messageInput.trim()}
                className="w-10 h-10 bg-indigo-500 text-white rounded-md flex items-center justify-center disabled:bg-gray-300"
              >
                ➤
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>

      {selectedUser && showProfile && (
        <div className="w-80 border-l border-gray-200 p-5 text-center relative">
          <button 
            className="absolute top-0 left-0 m-4 font-bold text-xl text-gray-500 hover:text-gray-700" 
            onClick={() => setShowProfile(false)}
          >
            ×
          </button>
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-600 text-2xl font-medium">
            {getInitials(selectedUser.name)}
          </div>
          <h2 className="text-xl font-medium mb-5">{selectedUser.name}</h2>
          <div className="text-left">
            <p className="text-gray-500 mb-2">+032165487924</p>
            <p className="text-gray-500">dianamoore@gmail.com</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat; 