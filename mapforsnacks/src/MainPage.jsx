import './MainPage.css';
import React from 'react';
import { useAuth } from './Authentication';
import { Link } from 'react-router-dom'; // For navigation to the map page
//import './MainPage.css'; //CSS for main page
import './App.css';

const MainPage = () => {
  const { isAuthenticated, login, logout } = useAuth(); 

  // Function to scroll to the About section
  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    aboutSection.scrollIntoView({ behavior: 'smooth' });
  };

  return (
  <div className="main-page">
      {/* Website Title with Snack Images */}
      <header className="title-section">
      <img src="/images/chips.png" alt="Left Snack" className="snack-image" />
      <h1>Maps For Snacks</h1>
      <img src="/images/soda.png" alt="Right Snack" className="snack-image" />
      </header>

      {/* Hero Section */}
      <section className="hero">
        <img 
          src="" 
          alt="Hero" 
          className="hero-image"
        />
        <div className="hero-content">
          <button onClick={scrollToAbout} className="hero-button">
            About Us
          </button>
          <Link to="/map">
            <button className="hero-button">Find Vending Machines</button>
          </Link>
          {!isAuthenticated ? (
            <button onClick={login} className="hero-button">
              Login
            </button>
            ) : (
            <div className="hero-content">
              <Link to="/profile">
                <button className="hero-button">Go to Profile</button>
              </Link>
              <button onClick={logout} className="hero-button">
                Logout
              </button>
            </div>
          )}
        </div>
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
