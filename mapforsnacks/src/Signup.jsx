import React, { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from './Authentication';
import { Link, useNavigate } from 'react-router-dom';
import FlashMessage from './FlashMessage';
import axios from 'axios';
import './Signup.css';
import './App.css';

function Signup() {
    const { isAuthenticated, login, logout } = useAuth();
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [flashMessage, setFlashMessage] = useState({ message: '', type: '' });

    const navigate = useNavigate();

    const setMessage = (message, type) => {
        sessionStorage.setItem('flashMessage', JSON.stringify({ message, type }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const res = await axios.post('http://localhost:5000/signup', { first_name, last_name, email, password });
            // console.log(res.data);

            setMessage('Signup successful! Please login.', 'success');
            navigate('/login');
        } catch (error) {
            // console.error('Error during signup:', error);
            // Handle error and display appropriate message
            if (error.response) {
                // The request was made, but the server responded with an error code
                if (error.response.data.msg.includes('Email already exists')) {
                    setFlashMessage({message: 'This email is already registered. Please use a different one.', type: 'error'});
                } else if (error.response.data.msg.includes('Password is too weak.')) {
                    setFlashMessage({message: 'Your password is too weak. Please use a stronger password.', type: 'error'});
                } else {
                    setFlashMessage({message: error.response.data.msg || 'Something went wrong!', type: 'error'});
                }
            } else if (error.request) {
                // The request was made, but no response was received
                setFlashMessage({message: 'No response from server. Please try again later.', type: 'error'});
            } else {
                // Something else went wrong
                setFlashMessage({message: 'An unexpected error occurred.', type: 'error'});
            }
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const token = credentialResponse.credential;
        // console.log("Google Login Success! ID Token: ", token); // debugging

        try {
            const response = await axios.post('http://localhost:5000/api/auth/google-login', {
                idToken: token,
            });

            // console.log('Google Login successful:', response.data); // debugging

            const accessToken = response.data.access_token;
            const userData = response.data.user;

            setToken(accessToken); // Store Google access token in state or localStorage
            localStorage.setItem('authToken', accessToken);
            login(userData, accessToken);

            setMessage('Google login successful!', 'success');
            // Redirect to profile after Google login
            navigate('/profile');
        } catch (error) {
            console.error('Google login error:', error);
            setFlashMessage({message: 'Google authentication failed.', type: 'error'});
        }
    };

    const handleGoogleFailure = (error) => {
        console.error("Google login failed: ", error);
        setFlashMessage({message: "Google login failed.", type: "error"});
    };

    return (
        <div className="signup-page">
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
            <section className="hero">
                <h1>Create an Account</h1>
            </section>
            <FlashMessage />
            {flashMessage.message && (
                <div style={{
                    padding: '10px 20px',
                    borderRadius: '5px',
                    color: '#fff',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '10px',
                    backgroundColor: flashMessage.type === 'success' ? 'green' : 'red',
                }}>
                    <p>{flashMessage.message}</p>
                </div>
            )}
            <div className="signup-form">
            <form onSubmit={handleSubmit} method="POST">
                <div>
                    <input type="text" className="form-input" name="first_name" placeholder="First Name" value={first_name} onChange={(e) => setFirstName(e.target.value)} required/>
                </div><br/>
                <div>
                    <input type="text" className="form-input" name="last_name" placeholder="Last Name" value={last_name} onChange={(e) => setLastName(e.target.value)} required/>
                </div><br/>
                <div>
                    <input type="text" className="form-input" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </div><br/>
                <div>
                    <input type="password" className="form-input" name="password" placeholder="Password" minLength="10" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                </div><br/>
                <button type="submit">Submit</button>
            </form>  
            {token && <p>Your token: {token}</p>}
            <GoogleOAuthProvider clientId='988046540404-rvnhbcvmi6ksqda0vgnj5gv0g8goebs2.apps.googleusercontent.com'>
                    <div className="google-login">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onFailure={handleGoogleFailure}
                        />
                    </div>
                </GoogleOAuthProvider>
            </div>
        </div>
    );
};

export default Signup;