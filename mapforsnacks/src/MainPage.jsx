import './MainPage.css';
import React from 'react';
import { useAuth } from './Authentication';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  const { isAuthenticated, login, logout } = useAuth(); 
  const navigate = useNavigate();

  // Function to scroll to the About section
  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    aboutSection.scrollIntoView({ behavior: 'smooth' });
  };

  const loginPage = () => {
    login();
    navigate('/login');
  }

  return (
    <div className="main-page">
      {/* Navigation Links */}
      <nav className="nav-links">
        <button onClick={scrollToAbout} className="nav-link">About Us</button>
        {!isAuthenticated ? (
          <>
            <Link to="/login" className="nav-link">Log in</Link>
            <Link to="/signup" className="nav-link">Sign up</Link>
          </>
        ) : (
          <>
            <Link to="/profile" className="nav-link">Profile</Link>
            <button onClick={logout} className="nav-link">Logout</button>
          </>
        )}
      </nav>

      {/* Vending Machine Images */}
      <div className="hero-images">
        <img src="/images/vending-machine2.png" alt="Vending Machine 1" className="hero-image"/>
        <img src="/images/vending-machine.png" alt="Vending Machine 2" className="hero-image"/>
        <img src="/images/vending-machine3.png" alt="Vending Machine 3" className="hero-image"/>
      </div>

      {/* Website Title */}
      <header className="title-section">
        <h1>MAP FOR SNACKS</h1>
      </header>

      

      

      {/* Main Description and Button */}
      <section className="description">
        <p>
          Our website helps you find snacks in vending machines across the UNCC campus.
          You can locate vending machines in real-time and check what snacks are available.
        </p>
        <Link to="/map">
          <button className="hero-button">Find Vending Machines</button>
        </Link>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <h2>About Us</h2>
        <p>
          Our website helps you find snacks in vending machines across the campus. You can locate
          vending machines in real-time and check what snacks are available.
        </p>
      </section>
    </div>
  );
};

export default MainPage;
