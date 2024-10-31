import React, { useEffect, useState } from 'react';
import SearchBar from './Searchbar';
import './MapPage.css';
import { mockData } from './mock_data';

const MapPage = () => {
    const [map, setMap] = useState(null);
    const [infoWindow, setInfoWindow] = useState(null); // To manage the info window
    const [filteredMachines, setFilteredMachines] = useState(mockData); // Start with mock data

    useEffect(() => {
        const loadGoogleMapsScript = () => {
            if (!window.google) {
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB2cgUyYlI3DBdzF_GA9WLi6uMoh75ONsY&libraries=places`;
                script.async = true;
                script.onload = () => initMap();
                document.head.appendChild(script);
            } else {
                initMap();
            }
        };
        loadGoogleMapsScript();
    }, []);

    const initMap = () => {
        const mapOptions = {
            center: { lat: 35.3075, lng: -80.7294 }, // Center map on UNCC campus
            zoom: 15,
        };
        const mapInstance = new window.google.maps.Map(document.getElementById('map'), mapOptions);
        setMap(mapInstance);
        addMarkers(mapInstance, filteredMachines);
    };

    const addMarkers = (mapInstance, machines) => {
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
    };

    const handleFilterChange = (query) => {
        const lowerCaseQuery = query.toLowerCase();
        const filtered = mockData.filter((machine) =>
            machine.location.toLowerCase().includes(lowerCaseQuery) ||
            machine.items.some((item) => item.toLowerCase().includes(lowerCaseQuery))
        );
        setFilteredMachines(filtered);
        addMarkers(map, filtered); // Update markers based on filtered results
    };

    return (
        <div className="map-page">
            <section className="hero">
                <h1>Vending Machines Map</h1>
            </section>
            <div className="search-bar">
                <SearchBar onFilterChange={handleFilterChange} />
            </div>
            <div id="map" className="map-container"></div>
        </div>
    );
};

export default MapPage;







