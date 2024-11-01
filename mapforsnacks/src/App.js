import React, {useState, useEffect, useRef} from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { gapi } from 'gapi-script';
import { AuthProvider, useAuth } from './content/Authentication';
import MainPage from './pages/MainPage';
import MapPage from './pages/MapPage';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import Login from './pages/Login';
import trigger from '../src/images/dropdown_icon.png';
import profile from '../src/images/account.png';
import map from '../src/images/google-maps.png';
import home from '../src/images/home.png';
import signup from '../src/images/add-account.png';
import './styles/App.css';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID; //'988046540404-rvnhbcvmi6ksqda0vgnj5gv0g8goebs2.apps.googleusercontent.com'

function App() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const { isAuthenticated, login, logout } = useAuth();

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: clientId,
        scope: ""
      });
    }
    gapi.load('client:auth2', start);

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
                  {!isAuthenticated ? ( 
                  <li className="dropdownItem">
                    <DropdownItem img= {signup} alt = {"Signup"} link = {"/signup"} text = {"Signup"}/>
                    <Link to='/login'>
                      <button>Login</button>
                    </Link>
                  </li>
                ) : (
                  <li className="dropdownItem">
                    <DropdownItem img= {profile} alt = {"Profile"} link = {"/profile"} text = {"Profile"}/>
                    <button onClick={logout}>Logout</button>
                  </li>
                )}
                </ul>
              </div>
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
