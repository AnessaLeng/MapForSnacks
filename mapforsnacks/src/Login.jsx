import React, { useState } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from './Authentication';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import './App.css';

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [token, setToken] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/login', { email, password });
            console.log('Login success:', res.data);

            const accessToken = res.data.access_token;
            const userData = res.data.user;

            setToken(accessToken);
            localStorage.setItem('authToken', accessToken);
            localStorage.setItem('userData', JSON.stringify(userData));

            login(userData, accessToken);

            setMessage("Login successful!");
            // Redirect to profile after successful login
            navigate('/profile');
        } catch (error) {
            console.error('Error during login:', error);
            if (error.response) {
                // Check if error.response is defined
                setMessage(error.response.data.msg || 'Something went wrong!');
            } else if (error.request) {
                // The request was made but no response was received
                setMessage('No response from server. Please try again later.');
            } else {
                setMessage('An unexpected error occurred.');
            }
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const token = credentialResponse.credential;
        //console.log("Google Login Success! ID Token: ", token); // debugging

        try {
            const response = await axios.post('http://localhost:5000/api/auth/google-login', {
                idToken: token,
            });

            //console.log('Google Login successful:', response.data); // debugging

            const accessToken = response.data.access_token;
            const userData = response.data.user;

            setToken(accessToken); // Store Google access token in state or localStorage
            localStorage.setItem('authToken', accessToken);
            login(userData, accessToken);

            setMessage("Google login successful!");
            // Redirect to profile after Google login
            navigate('/profile');
        } catch (error) {
            console.error('Google login error:', error);
            setMessage('Google authentication failed.');
        }
    };

    const handleGoogleFailure = (error) => {
        console.error("Google login failed: ", error);
        setMessage("Google login failed.");
    };

    return (
        <div className="login-page">
            <section className="hero">
                <h1>Login</h1>
            </section>
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
                {message && <p>{message}</p>}
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