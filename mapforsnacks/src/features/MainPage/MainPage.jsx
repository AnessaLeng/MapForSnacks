import './MainPage.css';
import React from 'react';
import { useAuth } from '../Authentication/Authentication';
import { Link } from 'react-router-dom';

const MainPage = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="main-page">
      {/* Navigation Links */}
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
      {/* Vending Machine Images */}
      <div className="hero-images">
        <img src="/images/vendingmachine-3.png" alt="Vending Machine 2" className="hero-image"/>
        <img src="/images/vendingmachine-4.png" alt="Vending Machine 1" className="hero-image"/>
        <img src="/images/vendingmachine-2.png" alt="Vending Machine 3" className="hero-image"/>
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
    </div>
  );
};

export default MainPage;
