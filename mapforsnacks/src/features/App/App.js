import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '../Authentication/Authentication';
import MainPage from '../MainPage/MainPage';
import MapPage from '../MapPage/MapPage';
import Profile from '../Profile/Profile';
import Favorites from '../Favorites/Favorites';
import Signup from '../Signup/Signup';
import Login from '../Login/Login';
import './App.css';
import '../MainPage/MainPage.css';


const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
    <AuthProvider>
      <Router>
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
