import React, {useState, useEffect} from 'react';

const mockData = [
    {'id': 1, 'location': 'Building 1', 'items': ['Soda', 'Candy', 'Vegan Snacks']},
    {'id': 2, 'location': 'Building 2', 'items': ['Seltzer Drinks', 'Water', 'Snacks']}
];

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/api/search');
            const data = await response.json();
            setResults(data);
        };

        fetchData();
    }, []);

    const handleSearch = (event) => {
        const value = event.target.value;
        setQuery(value);
        const filteredResults = mockData.filter(item =>
            item.name.toLowerCase().includes(value.toLowerCase())
        );
        setResults(filteredResults);
    };

    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="Search..."
            />
            <ul>
                {results.map(item => (
                    <li key={item.id}>{item.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default SearchBar;