import React, { useState } from 'react';
import { GoogleLogin } from 'react-google-login';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import '../styles/App.css';

const Login = ({ onGoogleSuccess, onGoogleFailure }) => {
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
                }
                else {
                    const errorData = await response.json();
                    console.error("Error logging in user: ", errorData);
                }
            }
            catch (error) {
                console.error("Error: ", error);
            }
        }
    };

    const handleGoogleSuccess = (response) => {
        const token = response.tokenId;
        onGoogleSuccess(token);
        navigate('/profile');
    };

    const handleGoogleFailure = (response) => {
        console.error("Google login failed: ", response);
        onGoogleFailure(response);
    };

    return (
        <div className="login-page">
            <section className="hero">
                <h1>Login</h1>
            </section>
            <div className="login-form">
                <form onSubmit={handleSubmit} method="POST">
                    <div>
                        <input type="text" className="form-input" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required/>
                        {errors.email && <div className="error-message">{errors.email}</div>}
                    </div><br/>
                    <div>
                        <input type="password" className="form-input" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required/>
                        {errors.password && <div className="error-message">{errors.password}</div>}
                    </div><br/>
                    <button type="submit">Submit</button>
                </form> 
                <div>
                    <GoogleLogin
                        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                        buttonText="Login with Google"
                        onSuccess={handleGoogleSuccess}
                        onFailure={handleGoogleFailure}
                        cookiePolicy={'single_host_origin'}
                    />
                </div> 
            </div>
        </div>
    );
}

export default Login;