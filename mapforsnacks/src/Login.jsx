import React, { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from './Authentication';
import { Link, useNavigate } from 'react-router-dom';
import FlashMessage from './FlashMessage';
import axios from 'axios';
import './Login.css';
import './App.css';

const Login = () => {
    const { isAuthenticated, login, logout } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [flashMessage, setFlashMessage] = useState({ message: '', type: '' });

    const navigate = useNavigate();

    const setMessage = (message, type) => {
        sessionStorage.setItem('flashMessage', JSON.stringify({ message, type }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/login', { email, password });
            // console.log('Login success:', res.data);

            const accessToken = res.data.access_token;
            const userData = res.data.user;

            setToken(accessToken);
            localStorage.setItem('authToken', accessToken);
            localStorage.setItem('userData', JSON.stringify(userData));

            login(userData, accessToken);

            setMessage("Login successful!", "success");
            // Redirect to profile after successful login
            navigate('/profile');
        } catch (error) {
            // console.error('Error during login:', error);
            if (error.response) {
                // The request was made, but the server responded with an error code
                if (error.response.data.msg.includes('400') || error.response.data.msg.includes('404')) {
                    setFlashMessage({message: 'Email or password was incorrectly entered. Try again.', type: 'error'});
                } else {
                    setFlashMessage({message: error.response.data.msg || '400 Error', type: 'error'});
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
        <div className="login-page">
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
                <h1>Login</h1>
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
            <div className="login-form">
                <form onSubmit={handleSubmit} method="POST">
                    <div>
                        <input type="text" className="form-input" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"/>
                    </div><br/>
                    <div>
                        <input type="password" className="form-input" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"/>
                    </div><br/>
                    <button type="submit">Submit</button><br/><br/>
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
}

export default Login;