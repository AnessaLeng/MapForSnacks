import React, {useState, useEffect, useRef} from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
//import { useAuth } from './Authentication';
import { AuthProvider } from './Authentication';
import MainPage from './MainPage';
import MapPage from './MapPage';
import Profile from './Profile';
import Signup from './Signup';
import trigger from '../src/images/dropdown_icon.png';
import profile from '../src/images/account.png';
import map from '../src/images/google-maps.png';
import home from '../src/images/home.png';
import signup from '../src/images/add-account.png';
import './App.css';

function App() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  //const { isAuthenticated } = useAuth();

  useEffect(() => {
    let handler = (event) =>{
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
    <AuthProvider>
      <Router>
        <div className="App">
          <div className="dropdown-container" ref={menuRef}>
            <div className="dropdown-trigger" onClick={()=>{setOpen(!open)}}>
              <img src={trigger} alt="dropdown_icon"/>
              </div>
              <div className={`dropdown-menu ${open ? 'active' : 'inactive'}`}>
                <h3>Hello<br/><span>Welcome to MapForSnacks!</span></h3>
                <ul>
                  <DropdownItem img= {home} alt = {"Home"} link = {"/"} text = {"Home"}/>
                  <DropdownItem img= {map} alt = {"Map"} link = {"/map"} text = {"Map"}/>
                  <DropdownItem img= {signup} alt = {"Signup"} link = {"/signup"} text = {"Signup"}/>
                  <DropdownItem img= {profile} alt = {"Profile"} link = {"/profile"} text = {"Profile"}/>
                  {/* isAuthenticated && <DropdownItem img= {profile} alt = {"Profile"} link = {"/profile"} text = {"Profile"}/> */}
                </ul>
              </div>
            </div>
        </div>
        <Routes>
          <Route path="/" element={<MainPage />} /> {/* MainPage on the root path */}
          <Route path="/map" element={<MapPage />} /> {/* Map page */}
          <Route path="/profile" element={<Profile />} /> {/* Profile page */}
          <Route path="/signup" element={<Signup />} /> {/* Signup page */}
        </Routes>
      </Router>
    </AuthProvider>
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

export default App;
