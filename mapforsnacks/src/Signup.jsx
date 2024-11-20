import React, { useState } from 'react';
//import { useAuth } from './Authentication';
import { useNavigate } from 'react-router-dom';
import FlashMessage from './FlashMessage';
import axios from 'axios';
import './Signup.css';
import './App.css';

function Signup() {
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

    return (
        <div className="signup-page">
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
            </div>
        </div>
    );
};

export default Signup;