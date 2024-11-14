import React, { useState } from 'react';
//import { useAuth } from './Authentication';
//import { Navigate } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';
import './App.css';

function Signup() {
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const res = await axios.post('http://localhost:5000/signup', { first_name, last_name, email, password });
            console.log(res.data);
            setMessage(res.data.msg);
        } catch (error) {
            console.error('Error during signup:', error);
            // Handle error and display appropriate message
            if (error.response) {
                // The request was made, but the server responded with an error code
                setMessage(error.response.data.msg || 'Something went wrong!');
            } else if (error.request) {
                // The request was made, but no response was received
                setMessage('No response from server. Please try again later.');
            } else {
                // Something else went wrong
                setMessage('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="signup-page">
            <section className="hero">
                <h1>Create an Account</h1>
            </section>
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
                    <input type="password" className="form-input" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                </div><br/>
                <button type="submit">Submit</button>
            </form>  
            {message && <p>{message}</p>}
            </div>
        </div>
    );
};

export default Signup;