import React, {useState, useEffect, useRef} from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
//import { gapi } from 'gapi-script';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './Authentication';
import MainPage from './MainPage';
import MapPage from './MapPage';
import Profile from './Profile';
import Signup from './Signup';
import Login from './Login';
import trigger from '../src/images/dropdown_icon.png';
import profile from '../src/images/account.png';
import map from '../src/images/google-maps.png';
import home from '../src/images/home.png';
import signup from '../src/images/add-account.png';
import loginimg from '../src/images/login.png';
import './App.css';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handler = (event) =>{
      if (!menuRef.current.contains(event.target)) {
        setOpen(false);
      }
      
    };

    document.addEventListener("mousedown", handler);

    return() => {
      document.removeEventListener("mousedown", handler);
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={clientId}>
    <AuthProvider>
      <Router>
        <div className="App">
          <div className="dropdown-container" ref={menuRef}>
            <div className="dropdown-trigger" onClick={()=>{setOpen(!open)}}>
              <img src={trigger} alt="dropdown_icon"/>
            </div>
            <ul>
              <div className={`dropdown-menu ${open ? 'active' : 'inactive'}`}>
              <h3>Hello<br/><span>Welcome to MapForSnacks!</span></h3>
                <li><DropdownItem img= {home} alt = {"Home"} link = {"/"} text = {"Home"}/></li>
                <li><DropdownItem img= {map} alt = {"Map"} link = {"/map"} text = {"Map"}/></li>
                {!isAuthenticated ? ( 
                <div>
                  <li><DropdownItem img= {signup} alt = {"Signup"} link = {"/signup"} text = {"Signup"}/></li>
                  <li><DropdownItem img= {loginimg} alt = {"Login"} link = {"/login"} text = {"Login"}/></li>
                </div>
              ) : (
                <div>
                  <li><DropdownItem img= {profile} alt = {"Profile"} link = {"/profile"} text = {"Profile"}/></li>
                  <li><button onClick={logout}>Logout</button></li>
                </div>
              )}
              </div>
            </ul>
          </div>
        </div>
        <Routes>
          <Route path="/" element={<MainPage />} /> {/* MainPage on the root path */}
          <Route path="/map" element={<MapPage />} /> {/* Map page */}
          <Route path="/profile" element={<Profile />} /> {/* Profile page */}
          <Route path="/signup" element={<Signup />} /> {/* Signup page */}
          <Route path="/login" element={<Login />} /> {/* Login page */}
        </Routes>
      </Router>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

function DropdownItem(item) {
  return (
    <li className="dropdownItem">
      <img src={item.img} alt={item.text}></img>
      <Link to={item.link}>{item.text}</Link>
    </li>
  );
}

const AppWithProvider = () => (
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
  <AuthProvider>
    <App />
  </AuthProvider>
  </GoogleOAuthProvider>
);

export default AppWithProvider;
