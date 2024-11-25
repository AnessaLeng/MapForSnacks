import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './Authentication';
import MainPage from './MainPage';
import MapPage from './MapPage';
import Profile from './Profile';
import Favorites from './Favorites';
import Signup from './Signup';
import Login from './Login';
import './App.css';
import './MainPage.css';


const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <GoogleOAuthProvider clientId={clientId}>
    <AuthProvider>
      <Router>
        <div className="App">
          <nav className="navbar">
            <ul className="navbar-list">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/map">Map</Link></li>
                {!isAuthenticated ? (
                    <>
                        <li><Link to="/signup">Signup</Link></li>
                        <li><Link to="/login">Login</Link></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/profile">Profile</Link></li>
                        <li><button onClick={logout}>Logout</button></li>
                    </>
                )}
            </ul>
          </nav>
        </div>
        <Routes>
          <Route path="/" element={<MainPage />} /> {/* MainPage on the root path */}
          <Route path="/map" element={<MapPage />} /> {/* Map page */}
          <Route path="/profile" element={<Profile />} /> {/* Profile page */}
          <Route path="/favorites" element={<Favorites />} /> {/* Favorites page */}
          <Route path="/signup" element={<Signup />} /> {/* Signup page */}
          <Route path="/login" element={<Login />} /> {/* Login page */}
        </Routes>
      </Router>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

const AppWithProvider = () => (
  <GoogleOAuthProvider clientId={clientId}>
  <AuthProvider>
    <App />
  </AuthProvider>
  </GoogleOAuthProvider>
);

export default AppWithProvider;
