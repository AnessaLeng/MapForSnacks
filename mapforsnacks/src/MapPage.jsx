import React, { useEffect, useState } from 'react';
import SearchBar from './Searchbar';
import './MapPage.css';
import { mockData } from './mock_data';

// Importing images
import helpIcon from './images/question.png';
import feedbackIcon from './images/feedback.png';

const MapPage = () => {
    const [map, setMap] = useState(null);
    const [infoWindow, setInfoWindow] = useState(null);
    const [filteredMachines, setFilteredMachines] = useState(mockData);

    useEffect(() => {
        const loadGoogleMapsScript = () => {
            if (!window.google) {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB2cgUyYlI3DBdzF_GA9WLi6uMoh75ONsY`;
                script.async = true;
                script.onload = () => initMap();
                script.onerror = () => console.error("Failed to load Google Maps script");
                document.head.appendChild(script);
            } else {
                initMap();
            }
        };
        loadGoogleMapsScript();
    }, []);

    const initMap = () => {
        if (!map && window.google && window.google.maps) {
            const mapOptions = {
                center: { lat: 35.3075, lng: -80.7294 },
                zoom: 15,
            };
            const mapInstance = new window.google.maps.Map(document.getElementById('map'), mapOptions);
            setMap(mapInstance);
            addMarkers(mapInstance, filteredMachines);
        }
    };

    const addMarkers = (mapInstance, machines) => {
        if (mapInstance) {
            const infoWindowInstance = new window.google.maps.InfoWindow();
            machines.forEach((machine) => {
                const marker = new window.google.maps.Marker({
                    position: { lat: machine.lat, lng: machine.lng },
                    map: mapInstance,
                    title: machine.location,
                });

                marker.addListener('click', () => {
                    infoWindowInstance.setContent(`
                        <div>
                            <h2>${machine.location}</h2>
                            <p>Items: ${machine.items.join(', ')}</p>
                            <a href="https://www.google.com/maps/dir/?api=1&destination=${machine.lat},${machine.lng}" 
                               target="_blank" 
                               rel="noopener noreferrer">Show in Google Maps</a>
                        </div>
                    `);
                    infoWindowInstance.open(mapInstance, marker);
                });
            });
            setInfoWindow(infoWindowInstance);
        }
    };

    const handleFilterChange = (query) => {
        const lowerCaseQuery = query.toLowerCase();
        const filtered = mockData.filter((machine) =>
            machine.location.toLowerCase().includes(lowerCaseQuery) ||
            machine.items.some((item) => item.toLowerCase().includes(lowerCaseQuery))
        );
        setFilteredMachines(filtered);
        clearMarkers();
        addMarkers(map, filtered);
    };

    const clearMarkers = () => {
        if (map && map.markers) {
            map.markers.forEach(marker => marker.setMap(null));
            map.markers = [];
        }
    };

    return (
        <div className="map-page">
            <div className="sidebar">
                <h2>Search By item or building...</h2>
                <div className="search-section">
                    <select onChange={(e) => handleFilterChange(e.target.value)}>
                        <option value="">Building</option>
                    </select>
                    <select onChange={(e) => handleFilterChange(e.target.value)}>
                        <option value="">Snack Type</option>
                    </select>
                    <select onChange={(e) => handleFilterChange(e.target.value)}>
                        <option value="">Food Type</option>
                    </select>
                </div>

                <div className="directions">
                    <div className="icon-container">
                        <i className="fas fa-car"></i>
                        <i className="fas fa-bicycle"></i>
                        <i className="fas fa-walking"></i>
                    </div>
                    <h3>Directions</h3>
                    <input type="text" placeholder="From" className="button" />
                    <input type="text" placeholder="To" className="button" />
                    <button className="button">Go!</button>
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
        </div>
    );
};

export default MapPage;
