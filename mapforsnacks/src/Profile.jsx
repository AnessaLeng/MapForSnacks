import React, { useEffect, useState } from 'react';
import { useAuth } from './Authentication';
import { Navigate } from 'react-router-dom';
import './Profile.css';
import './App.css';

function Profile() {
    const { isAuthenticated, googleId, user } = useAuth();
    const {userInfo, setUserInfo} = useState({})
    const [searchHistory, setSearchHistory] = useState([]);

    useEffect(() => {
        const fetchUserInfo = async () => {
            if (!googleId) return;
            try {
                const response = await fetch(`http://localhost:3000/api/user-info?google_id=${googleId}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setUserInfo(data);
            }
            catch (error) {
                console.error('Error fetching user info: ', error);
            }
        }

        const fetchSearchHistory = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/search-history'); //tbd - connect to database
                const data = await response.json();
                setSearchHistory(data);
            }
            catch (error) {
                console.error('Error fetching search history: ', error);
            }
        };

        if (isAuthenticated) {
            fetchUserInfo();
            fetchSearchHistory();
        }
    }, [isAuthenticated, googleId, setUserInfo]);


    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }

    return (
        <div className="profile-page">
            <section className="hero">
                <h1>{user ? `${user.firstName} ${user.lastName}'s` : "Profile"} Profile</h1>
            </section>
            <section className="user-info">
                <h3>Name: {user ? `${user.firstName} ${user.lastName}` : 'N/A'}</h3>
                <h3>Email: {user ? user.email : 'N/A'}</h3>
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
        </div>
    );
}

export default Profile;