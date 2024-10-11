import React, { useEffect, useState } from 'react';
import { useAuth } from './Authentication';
import { Navigate } from 'react-router-dom';
import './Profile.css';

function Profile() {
    const { isAuthenticated } = useAuth();
    const [searchHistory, setSearchHistory] = useState([]);

    useEffect(() => {
        const fetchSearchHistory = async () => {
            try {
                const response = await fetch('http://localhost:5000/search-history'); //tbd - connect to database
                const data = await response.json();
                setSearchHistory(data);
            }
            catch (error) {
                console.error('Error fetching search history: ', error);
            }
        };

        if (isAuthenticated) {
            fetchSearchHistory();
        }
    }, [isAuthenticated]);


    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }

    return (
        <div>
            <h1>Profile</h1>
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
        </div>
    );
}

export default Profile;