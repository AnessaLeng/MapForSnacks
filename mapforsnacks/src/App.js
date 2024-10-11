import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AuthProvider } from './Authentication';
import MainPage from './MainPage';
import MapPage from './MapPage';
import Profile from './Profile';
import trigger from '../src/images/dropdown_icon.png'
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <div className="dropdown-container">
            <div className="dropdown-trigger">
              <img src={trigger} alt="dropdown_icon"></img>
              </div>
                <nav>
                  <Link to="/">Home</Link>
                  <Link to="/map">Map</Link>
                  <Link to="/profile">Profile</Link>
                </nav>
            </div>
        </div>
        <Routes>
          <Route path="/" element={<MainPage />} /> {/* MainPage on the root path */}
          <Route path="/map" element={<MapPage />} /> {/* Map page */}
          <Route path="/profile" element={<Profile />} /> {/* Profile page */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
