import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './Authentication';
import { Link, useNavigate } from 'react-router-dom';
import FlashMessage from './FlashMessage';
import './Favorites.css';
import './App.css';

function Favorites() {
    const { isAuthenticated, googleId, user, logout } = useAuth();
    const [profileData, setProfileData] = useState(null);
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
        }

        if (isAuthenticated) {
            fetchFavorites(); // Fetch favorites if authenticated
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

    if (!profileData) {
        return <div>Loading user favorites...</div>;  // Display loading while waiting for profileData
    }

    return (
        <div className="favorites-page">
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
            <h1>{`${profileData.first_name}'s Favorites`}</h1>
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
            <section className="favorites">
                <div>
                <h3>Favorites</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Building</th>
                                <th>Floor</th>
                                <th>Offering</th>
                                <th colSpan="2">Vending ID</th>
                            </tr>
                        </thead>
                        <tbody>
                        {favorites.length > 0 ? (
                            favorites.map((entry) => (
                            <tr key={entry._id}>
                                <td>{entry.building_name}</td>
                                <td>{entry.floor}</td>
                                <td>{entry.Offering}</td>
                                <td>{entry.vending_id}</td>
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
        </div>
    );
}

export default Favorites