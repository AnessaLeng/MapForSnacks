import React, { useEffect, useState } from 'react';
import './MapPage.css';
import helpIcon from './images/question.png';
import feedbackIcon from './images/feedback.png';

const MapPage = () => {
    const [map, setMap] = useState(null); // Google Map instance
    const [allMachines, setAllMachines] = useState([]); // Holding all vending machine data from API
    const [snacks, setSnacks] = useState([]); // Holding all snack data from API
    const [markers, setMarkers] = useState([]); // Marker instances displayed on the map

    // Fetch vending machine data on component mount
    useEffect(() => {
        const fetchMachines = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/api/buildings'); // Fetch building data
                const data = await response.json();

                // Transform API data into a format usable for the map
                const transformedData = data.map((machine) => ({
                    id: machine.building_id,
                    location: machine.building_name,
                    lat: parseFloat(machine.lat),
                    lng: parseFloat(machine.lng),
                    vending_id: machine.vending_id,
                    floor: machine.floor, // Include the floor field
                    Offering: machine.Offering,
                    Image: machine.image
                }));
                setAllMachines(transformedData); // Store transformed data in state
                loadGoogleMapsScript(transformedData); // Load Google Maps API
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        const fetchSnacks = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/api/snacks'); // Fetch snack data
                const data = await response.json();
                setSnacks(data); // Store snack data in state
            } catch (error) {
                console.error('Failed to fetch snack data:', error);
            }
        };

        fetchMachines();
        fetchSnacks();
    }, []);

    // Load the Google Maps script
    const loadGoogleMapsScript = (machines) => {
        if (!window.google || !window.google.maps) {
            if (!document.getElementById('google-maps-script')) {
                const script = document.createElement('script');
                script.id = 'google-maps-script';
                script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB2cgUyYlI3DBdzF_GA9WLi6uMoh75ONsY&libraries=places`;
                script.async = true;
                script.onload = () => initMap(machines); // Initialize the map after script loads
                script.onerror = () => console.error('Failed to load Google Maps script');
                document.head.appendChild(script);
            }
        } else {
            initMap(machines); // Initialize the map if Google Maps is already loaded
        }
    };

    // Initialize Google Map and add markers
    const initMap = (machines) => {
        if (!map && window.google && window.google.maps) {
            const mapOptions = {
                center: { lat: 35.3075, lng: -80.7294 }, // Default center point
                zoom: 17,
            };

            const mapInstance = new window.google.maps.Map(
                document.getElementById('map'),
                mapOptions
            );
            setMap(mapInstance); // Set map instance in state
            addMarkers(mapInstance, machines); // Add markers to the map
        }
    };

    // Clear existing markers from the map
    const clearMarkers = () => {
        markers.forEach((marker) => marker.setMap(null)); // Remove each marker
        setMarkers([]); // Clear marker state
    };

    // Add markers to the map for each vending machine
    const addMarkers = (mapInstance, machines) => {
        clearMarkers(); // Clear existing markers before adding new ones

        const newMarkers = machines.map((machine) => {
            if (!machine.lat || !machine.lng) {
                console.error(`Invalid coordinates for machine: ${JSON.stringify(machine)}`);
                return null; // Skip machines with invalid geolocation
            }

            const marker = new window.google.maps.Marker({
                position: { lat: machine.lat, lng: machine.lng },
                map: mapInstance,
                title: machine.location,
            });

            // Check if vending_id exists and handle accordingly
            const vendingMachineInfo = Array.isArray(machine.vending_id)
                ? machine.vending_id.map((id) => `<li>Vending Machine ID: ${id}</li>`).join('')
                : `Vending ID: ${machine.vending_id || 'No vending machines available'}`;

            // Create the info window content
            const infoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
                        <h1 style="margin: 0 0 10px; font-size: 16px; font-weight: bold;">${machine.location}</h1>
                        <p>${vendingMachineInfo || "No Vending Info Available"}</p>
                        <p>Floor: ${machine.floor || 'N/A'}</p>
                        <p>Offering: ${machine.Offering || 'No Offerings'}</p>
                        <a href="https://www.google.com/maps/dir/?api=1&destination=${machine.lat},${machine.lng}" 
                           target="_blank" 
                           rel="noopener noreferrer" 
                           style="color: #4285F4; text-decoration: none; font-weight: bold;">Show in Google Maps</a>
                    </div>
                `,
            });
            
            // Add click event listener to the marker
            marker.addListener('click', () => {
                infoWindow.open(mapInstance, marker);
            });

            return marker;
        });

        // Filter out null markers and update state
        setMarkers(newMarkers.filter((marker) => marker !== null));
    };

    // Filter vending machines based on user input
    const handleFilterChange = (query) => {
        const lowerCaseQuery = query.toLowerCase();
        const filtered = allMachines.filter((machine) =>
            machine.location.toLowerCase().includes(lowerCaseQuery)
        );
        clearMarkers();
        addMarkers(map, filtered);
    };

    return (
        <div className="map-page">
            <div className="sidebar">
                <h2>Search by item or building...</h2>
                <div className="search-section">
                    {/* Dropdown filters for building, snack, and food types */}
                    <select onChange={(e) => handleFilterChange(e.target.value)}>
                        <option value="">Building</option>
                        {/* Add building options dynamically here */}
                    </select>
                    <select onChange={(e) => handleFilterChange(e.target.value)}>
                        <option value="">Snack Type</option>
                        {/* Add snack options dynamically here */}
                    </select>
                    <select onChange={(e) => handleFilterChange(e.target.value)}>
                        <option value="">Food Type</option>
                        {/* Add food options dynamically here */}
                    </select>
                </div>
                <div className="help-feedback">
                    <div className="help-item">
                        <img src={helpIcon} alt="Help Icon" className="icon" />
                        <span>Help</span>
                    </div>
                    <div className="help-item">
                        <img src={feedbackIcon} alt="Feedback Icon" className="icon" />
                        <span>Feedback</span>
                    </div>
                </div>
            </div>
            <div className="map-container">
                <section className="hero">
                    <h1>Vending Machines Map</h1>
                </section>
                <div id="map"></div>
            </div>
            <div className="snack-table-container">
                <h2>Snack Offerings</h2>
                <table className="snack-table">
                    <thead>
                        <tr>
                            <th>Snack ID</th>
                            <th>Snack Name</th>
                            <th>Category</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {snacks.map((snack) => (
                            <tr key={snack.snack_id}>
                                <td>{snack.snack_id}</td>
                                <td>{snack.snack_name}</td>
                                <td>{snack.category}</td>
                                <td>${snack.price.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MapPage;


