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
            if (!token) {
                console.error('No token found');
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/favorites', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setFavorites(response.data);  // Update state with fetched favorites
            } catch (error) {
                console.error('Error fetching favorites: ', error);
            }
        };

        const fetchSearchHistory = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                console.error('No token found');
                return;
            }

            try {
                const response = await axios.get('http://127.0.0.1:5000/api/search_history', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }); 
                setSearchHistory(response.data);
            } catch (error) {
                console.error('Error fetching search history:', error);
                //setFlashMessage({message: "Failed to load search history.", type: "error"});
                if (error.response) {
                    console.error('Response error:', error.response);
                } else if (error.request) {
                    console.error('Request error:', error.request);
                } else {
                    console.error('General error:', error.message);
                }
        
            }
        };

        if (isAuthenticated) {
            fetchFavorites(); // Fetch favorites if authenticated
            fetchSearchHistory(); // Fetch search history if authenticated
        }
    }, [isAuthenticated, googleId]);

    const handleDeleteFavorite = async (buildingName) => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.delete(`http://localhost:5000/favorites`, {
                headers: {
                    Authorization: `Bearer ${token}`,  // Add the token in the header
                },
                data: { building_name: buildingName}
            });

            if (response.status === 200) {
                setFavorites(prevFavorites => prevFavorites.filter(fav => fav.building_name !== buildingName));
                setFlashMessage({message: "Favorite removed successfully.", type: "success"});
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
            setFlashMessage({message: "Failed to remove favorite. Please try again.", type: "error"});
        }
    };

    const handleDeleteSearchHistory = async () => {
        const token = localStorage.getItem('authToken');
            if (window.confirm('Are you sure you want to delete your search history?')) {
            try {
                const response = await axios.delete(`http://localhost:5000/search_history`, {
                    headers: {
                        Authorization: `Bearer ${token}`,  // Add the token in the header
                    }
                });

                if (response.status === 200) {
                    setSearchHistory([]);
                    setFlashMessage({message: "Search history removed successfully.", type: "success"});
                }
            } catch (error) {
                console.error('Error removing search history:', error);
                setFlashMessage({message: "Failed to remove history. Please try again.", type: "error"});
            } 
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
        return <div>Loading user profile...</div>;  // Display loading while waiting for profileData
    }


    return (
        <div className="profile-page">
            <section className="hero">
            <h1>{`${profileData.first_name} ${profileData.last_name}'s Profile`}</h1>
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
                <h3>Name: {`${profileData.first_name} ${profileData.last_name}` || 'N/A'}</h3>
                <h3>Email: {profileData.email || 'N/A'}</h3>
            </section>
            <section className="favorites">
                <div>
                    <h3>Favorites</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Building</th>
                                <th>Floor</th>
                                <th colSpan="2">Offering</th>
                            </tr>
                        </thead>
                        <tbody>
                        {favorites.length > 0 ? (
                            favorites.map((entry) => (
                            <tr key={entry._id}>
                                <td>{entry.building_name}</td>
                                <td>{entry.floor}</td>
                                <td>{entry.Offering}</td>
                                <td>
                                    <button
                                        onClick={() => handleDeleteFavorite(entry.building_name)}
                                        className="delete-button"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                        ) : (  
                            <tr><td colSpan="4">No favorites added.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </section>
            <section className="search-history">
                <div>
                    <h3>Recent Search History</h3>
                    <button onClick={handleDeleteSearchHistory} className="delete-button">
                        Delete History
                    </button>
                    <table>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Directions</th>
                                <th>Filtered Search</th>
                            </tr>
                        </thead>
                        <tbody>
                            {searchHistory.length > 0 ? (
                                searchHistory.map((entry, index) => {
                                    const formattedTimestamp = new Date(entry.timestamp).toLocaleString();
                                    return (
                                    <tr key={index}>
                                        <td>{formattedTimestamp}</td>
                                        <td>{`${entry.from} → ${entry.to}`}</td>
                                        <td>{entry.building_name || 'N/A'}</td>
                                    </tr>
                                    );
                                })
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