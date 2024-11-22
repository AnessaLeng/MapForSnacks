import React, { useState } from 'react';
import { mockData } from './mock_data';
import axios from 'axios';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const handleSearch = (event) => {
        const value = event.target.value;
        setQuery(value);

        if (value.trim() === '') {
            setSuggestions([]);
        } else {
            const lowerCaseValue = value.toLowerCase();

            // Check if query matches a building name
            const buildingMatch = mockData.filter((machine) =>
                machine.location.toLowerCase().includes(lowerCaseValue)
            );

            // Check if query matches an item name
            const itemMatch = mockData.filter((machine) =>
                machine.items.some((item) => item.toLowerCase().includes(lowerCaseValue))
            );

            // Set suggestions based on the type of match
            if (buildingMatch.length > 0) {
                // Display items available in the matching buildings
                const itemsInBuilding = buildingMatch.map((machine) => ({
                    location: machine.location,
                    items: machine.items,
                    directions: `https://www.google.com/maps/dir/?api=1&destination=${machine.lat},${machine.lng}`

                }));
                setSuggestions(itemsInBuilding);

            } else if (itemMatch.length > 0) {
                // Display buildings that have the matching item
                const buildingsWithItem = itemMatch.map((machine) => ({
                    location: machine.location,
                    items: machine.items,
                    directions: `https://www.google.com/maps/dir/?api=1&destination=${machine.lat},${machine.lng}`
                }));
                setSuggestions(buildingsWithItem);

            } else {
                setSuggestions([]);
            }
        }
    };

    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="Search by item or building..."
            />
            {suggestions.length > 0 && (
                <ul>
                    {suggestions.map((result, index) => (
                        <li key={index}>
                            <strong>{result.location}</strong>: {result.items.join(', ')}
                            <a 
                            href={result.directions} target="_blank" style={{ marginLeft: '10px' }}> Get Directions </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;


