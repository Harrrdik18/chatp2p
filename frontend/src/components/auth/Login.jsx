import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post('/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      login(response.data);
      navigate('/'); // Redirect to home/chat after login
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-200">
      <div className="bg-white p-10 rounded-2xl w-full max-w-md relative shadow-md">
        <div className="flex items-center gap-1 mb-8">
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-1 rounded text-2xl font-medium">M</span>
          <span className="text-2xl text-gray-800">chat</span>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">{error}</div>}
          
          <div className="flex flex-col gap-1">
            <label className="font-medium text-gray-700">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="font-medium text-gray-700">Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button 
            type="submit" 
            className="w-full p-3 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition mt-2"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account? {' '}
          <Link to="/signup" className="text-indigo-600 hover:underline">
            Sign Up
          </Link>
        </p>
        
        <div className="absolute top-4 right-4 w-8 h-8 bg-dots-gray"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 bg-dots-gray"></div>
      </div>
    </div>
  );
};

export default Login; 