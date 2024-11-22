import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './Authentication';
import { useNavigate, Navigate } from 'react-router-dom';
import FlashMessage from './FlashMessage';
import './Profile.css';
import './App.css';

function Profile() {
    const { isAuthenticated, googleId, user, logout } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [searchHistory, setSearchHistory] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [flashMessage, setFlashMessage] = useState({ message: '', type: '' });

    const navigate = useNavigate();
    
    const setMessage = (message, type) => {
        sessionStorage.setItem('flashMessage', JSON.stringify({ message, type }));
    };


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
            })
            .catch(error => {
                console.error('403 Error: Forbidden: ', error);
                setMessage("You need to log in first to view this page.", "error");
                navigate('/login');
            });
        } else if (googleId) { // If user logged in with Google
            setProfileData({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
            });
        } else {
            // Handle the case where no token is found
            console.error('401 Error: Unauthorized');
            setMessage("You need to log in first to view this page.", "error");
            navigate('/login');
        }  
        }, [googleId, user]); 

    useEffect(() => {
        const fetchFavorites = async () => {
            const token = localStorage.getItem('authToken');

            try {
                const response = await fetch('http://localhost:3000/api/favorites', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setFavorites(data);
                } else {
                    throw new Error('Error fetching favorites');
                }
            }
            catch (error) {
                console.error('500 Error: Unable to fetch favorites: ', error);
            }
        };

        const fetchSearchHistory = async () => {
            const token = localStorage.getItem('authToken');

            try {
                const response = await fetch('http://localhost:3000/api/search-history', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error fetching search history: ${response.statusText}`);
                }
                const data = await response.json();
                setSearchHistory(data);
            } catch (error) {
                console.error('Error fetching search history: ', error);
                //setFlashMessage({message: "Failed to load search history.", type: "error"});
            }
        };

        fetchFavorites(); // Fetch favorites if authenticated
        fetchSearchHistory(); // Fetch search history if authenticated

    }, [isAuthenticated, googleId]);

    const handleDeleteFavorite = async (favoriteId) => {
        try {
            const response = await axios.delete(`http://localhost:3000/api/favorites/${favoriteId}`);

            if (response.status === 200) {
                setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== favoriteId));
                setFlashMessage({message: "Favorite removed successfully.", type: "success"});
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
            setFlashMessage({message: "Failed to remove favorite. Please try again.", type: "error"});
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');  // Redirect to login page after logout
    };


    // If the user is not authenticated, redirect to the login page
    if (!isAuthenticated && !googleId) {
        setMessage("You must log in first.", "error");
        return <Navigate to="/login" />;
    }

    if (!profileData) {
        return <div>Error loading profile or user not authorized.</div>;
    }

    return (
        <div className="profile-page">
            <section className="hero">
            <h1>{profileData.first_name ? `${profileData.first_name} ${profileData.last_name}'s Profile` : "Profile"}</h1>
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
            <section className="user-info">
                <h3>Name: {profileData.first_name ? `${profileData.first_name} ${profileData.last_name}` : 'N/A'}</h3>
                <h3>Email: {profileData.email || 'N/A'}</h3>
            </section>
            <section className="favorites">
                <div>
                    <h3>Favorites</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Building</th>
                                <th>Location</th>
                                <th>Timestamp</th>
                                <th>Delete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {favorites.length > 0 ? (
                                favorites.map((entry, index) => (
                                    <tr key={index}>
                                        <td>{entry.building_name}</td>
                                        <td>Latitude: {entry.lat}, Longitude: {entry.lng}</td>
                                        <td>{new Date(entry.timestamp).toLocaleString()}</td>
                                        <td>
                                            <button 
                                                onClick={() => handleDeleteFavorite(entry.id)} 
                                                className="delete-button">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4">No favorites available.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
            <section className="search-history">
                <div>
                    <h3>Recent Search History</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Vending Machine</th>
                                <th>Snack</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {searchHistory.length > 0 ? (
                                searchHistory.map((entry, index) => (
                                    <tr key={index}>
                                        <td>{entry.vending_id}</td>
                                        <td>{entry.snack_id}</td>
                                        <td>{new Date(entry.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="3">No search history available.</td></tr>
                            )}
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