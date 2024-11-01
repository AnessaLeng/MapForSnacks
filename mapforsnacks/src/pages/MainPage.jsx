import React, { useEffect } from 'react';
import { useAuth } from '../content/Authentication';
import { Link, useNavigate } from 'react-router-dom'; // For navigation to the map page
import LoginButton from '../components/login';
import LogOutButton from '../components/logout';
import '../styles/MainPage.css';
import '../styles/App.css';

const MainPage = () => {
  const { isAuthenticated, login, setUser, setError } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile'); // Redirect to the profile page
    }
  }, [isAuthenticated, navigate]);

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
      <h1>Map For Snacks</h1>
      <img src="/images/soda.png" alt="Right Snack" className="snack-image" />
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <button onClick={scrollToAbout} className="hero-button">
            About Us
          </button>
          <Link to="/map">
            <button className="hero-button">Find Vending Machines</button>
          </Link>
          {!isAuthenticated ? (
            <div className="hero-content">
              <Link to="/signup">
              <button className="hero-button">Signup</button>
              </Link>
              <Link to="/login">
              <button onClick={login} className="hero-button">Login</button>
              </Link>
              <LoginButton setUser={setUser} setError={setError} />
            </div>
            ) : (
            <div className="hero-content">
              <Link to="/profile">
                <button className="hero-button">Go to Profile</button>
              </Link>
              <LogOutButton />
            </div>
          )}
        </div>
      </section>

      <br/><div className="hero-images">
          <img src="/images/vending-machine2.png" alt="vending-machine" className="hero-image"/>
          <img src="/images/vending-machine.png" alt="vending-machine" className="hero-image"/>
          <img src="/images/vending-machine3.png" alt="vending-machine" className="hero-image"/>
      </div>      

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
