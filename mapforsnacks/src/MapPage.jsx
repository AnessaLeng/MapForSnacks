import React from 'react';
import SearchBar from './Searchbar';
import './MapPage.css';
import './App.css';

const MapPage = () => {
  return (
    <div className="map-page">
      <section className="hero">
        <h1>Vending Machines Map</h1>
      </section>
      <div className="search-bar">
          <SearchBar />
      </div>
      {/* Google Maps integration */}
    </div>
  );
};

export default MapPage;
