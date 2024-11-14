import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './Authentication';
import { useNavigate, Navigate } from 'react-router-dom';
import './Profile.css';
import './App.css';

function Profile() {
    const { isAuthenticated, googleId, user, logout } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchHistory, setSearchHistory] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');

        if (token) {
            axios.get('http://localhost:5000/profile', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                setProfileData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching profile:', error);
                setLoading(false);
                setError('Error fetching profile data.');
            });
        } else if (googleId) { // If user logged in with Google
            setProfileData({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
            });
            setLoading(false);
        } else {
            // Handle the case where no token is found
            setLoading(false);
            setError('User is not authenticated');
        }  
        }, [googleId, user]); 

    useEffect(() => {
        const fetchSearchHistory = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/search-history');
                const data = await response.json();
                setSearchHistory(data);
            }
            catch (error) {
                console.error('Error fetching search history: ', error);
            }
        };

        if (isAuthenticated || googleId) {
            fetchSearchHistory(); // Fetch search history if authenticated
        }
    }, [isAuthenticated, googleId]);

    const handleLogout = () => {
        logout();
        navigate('/login');  // Redirect to login page after logout
    };


    // If the user is not authenticated, redirect to the login page
    if (!isAuthenticated && !googleId) {
        return <Navigate to="/login" />;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!profileData) {
        return <div>Error loading profile or user not authorized.</div>;
    }

    return (
        <div className="profile-page">
            <section className="hero">
            <h1>{profileData.first_name ? `${profileData.first_name} ${profileData.last_name}'s Profile` : "Profile"}</h1>
            </section>
            <section className="user-info">
                <h3>Name: {profileData.first_name ? `${profileData.first_name} ${profileData.last_name}` : 'N/A'}</h3>
                <h3>Email: {profileData.email || 'N/A'}</h3>
            </section>
            <section className="search-history">
                <div>
                    <h3>Search History</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Searched</th>
                                <th>Location</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {searchHistory.map((entry, index) => (
                                <tr key={index}>
                                    <td>{entry.searched_input}</td>
                                    <td>{entry.location}</td>
                                    <td>{entry.timestamp.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            <section className="logout-section">
                <button onClick={handleLogout}>Logout</button>
            </section>
        </div>
    );
}

export default Profile;