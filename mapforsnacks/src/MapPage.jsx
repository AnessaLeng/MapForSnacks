import React, { useEffect, useState } from 'react';
import SearchBar from './Searchbar';
import './MapPage.css';
import './App.css';

const MapPage = () => {
  const [map, setMap] = useState(null);
  const [vendingMachines, setVendingMachines] = useState([]);
  const [filteredMachines, setFilteredMachines] = useState([]);

  useEffect(() => {
    // load Google Maps script
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

    // Fetch and show vending machines on map
    const fetchedMachines = [
      //example
      { id: 1, name: 'Library Vending', lat: 35.3082, lng: -80.7337, type: 'Snacks' }
    ];

    setVendingMachines(fetchedMachines);
    setFilteredMachines(fetchedMachines);
    addMarkers(mapInstance, fetchedMachines);
  };

  const addMarkers = (mapInstance, machines) => {
    machines.forEach((machine) => {
      const marker = new window.google.maps.Marker({
        position: { lat: machine.lat, lng: machine.lng },
        map: mapInstance,
        title: machine.name,
      });
    });
  };

  const handleFilterChange = (filter) => {
    const filtered = vendingMachines.filter((machine) => machine.type.includes(filter));
    setFilteredMachines(filtered);
    addMarkers(map, filtered);
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