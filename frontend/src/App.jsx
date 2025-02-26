import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Chat from './components/chat/Chat'
import './styles/App.css'

const AppContent = () => {
  const { isAuthenticated, logout } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="app">
      {!isAuthenticated ? (
        <div className="auth-wrapper">
          <h1>P2P Chat Application</h1>
          {showSignup ? (
            <>
              <Signup />
              <p className="auth-switch">
                Already have an account?{' '}
                <button onClick={() => setShowSignup(false)}>Login</button>
              </p>
            </>
          ) : (
            <>
              <Login />
              <p className="auth-switch">
                Don't have an account?{' '}
                <button onClick={() => setShowSignup(true)}>Sign Up</button>
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="main-content">
          <header className="app-header">
            <h1>P2P Chat</h1>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </header>
          <Chat />
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
