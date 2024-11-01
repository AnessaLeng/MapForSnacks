import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from './Authentication';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import './App.css';

const Login = () => {
    const { login, setError } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const validate = () => {
        const newErrors = {};
        Object.keys(formData).forEach((field) => {
            if (!formData[field]) {
                newErrors[field] = `${field.replace('_', ' ')} is required.`;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (validate()) {
            try {
                const response = await fetch('http://localhost:3000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    console.log("User logged in successfully!");
                    navigate('/profile');
                } else {
                    const errorData = await response.json();
                    console.error("Error logging in user: ", errorData);
                }
            } catch (error) {
                console.error("Error: ", error);
            }
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const token = credentialResponse.credential;
        console.log("Google Login Success! ID Token: ", token);
        const userPayload = jwtDecode(token);
        const userData = {
            firstName: userPayload.given_name || "N/A",
            lastName: userPayload.family_name || "N/A",
            email: userPayload.email || "N/A"
        };
        login(userData, token);
        navigate('/profile');
    };

    const handleGoogleFailure = (error) => {
        console.error("Google login failed: ", error);
    };

    return (
        <div className="login-page">
            <section className="hero">
                <h1>Login</h1>
            </section>
            <div className="login-form">
                <form onSubmit={handleSubmit}>
                    <div>
                        <input type="text" className="form-input" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required autoComplete="email"/>
                        {errors.email && <div className="error-message">{errors.email}</div>}
                    </div><br/>
                    <div>
                        <input type="password" className="form-input" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required autoComplete="current-password"/>
                        {errors.password && <div className="error-message">{errors.password}</div>}
                    </div><br/>
                    <button type="submit">Submit</button><br/><br/>
                </form>
                <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
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