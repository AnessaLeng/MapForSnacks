import React, { useEffect, useState, useRef } from "react";
import Select from "react-select";
import "./MapPage.css";
import { fetchBuildings, fetchVendingMachines, fetchSnacks } from "./api/api";


const MapPage = () => {
  const [map, setMap] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildings, setSelectedBuildings] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [buildings, vendingMachines, snacks] = await Promise.all([
          fetchBuildings(),
          fetchVendingMachines(),
          fetchSnacks(),
        ]);

        const combinedData = buildings.map((building) => ({
          ...building,
          lat: parseFloat(building.lat),
          lng: parseFloat(building.lng),
          vending_machines: vendingMachines
            .filter((vm) => vm.building_name === building.building_name)
            .map((machine) => ({
              ...machine,
              ...snacks.find((snack) => snack.snack_id === machine.snack_id),
            })),
        }));

        setMapData(combinedData);
        setBuildings(
          buildings.map((building) => ({
            label: building.building_name,
            value: building.building_name,
          }))
        );
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    
    loadGoogleMapsScript();
    loadData();
  }, []);

  useEffect(() => {
    if (map && mapData.length > 0) {
      clearMarkers();
      addMarkers(map, mapData);
      initAutocomplete();
    }
  }, [map, mapData]);

  const loadGoogleMapsScript = () => {
    if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB2cgUyYlI3DBdzF_GA9WLi6uMoh75ONsY&libraries=places`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else if (window.google?.maps) {
      initMap();
    }
  };

  const initMap = () => {
    if (!map) {
      const mapInstance = new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: 35.3075, lng: -80.7294 },
        zoom: 15,
      });
      setMap(mapInstance);

      const directionsRendererInstance = new window.google.maps.DirectionsRenderer();
      directionsRendererInstance.setMap(mapInstance);
      setDirectionsRenderer(directionsRendererInstance);
    }
  };

  const initAutocomplete = () => {
    if (window.google?.maps?.places) {
      new window.google.maps.places.Autocomplete(fromInputRef.current).bindTo("bounds", map);
      new window.google.maps.places.Autocomplete(toInputRef.current).bindTo("bounds", map);
    }
  };

  const addMarkers = (mapInstance, data) => {
    const infoWindow = new window.google.maps.InfoWindow();

    data.forEach((building) => {
      const marker = new window.google.maps.Marker({
        position: { lat: building.lat, lng: building.lng },
        map: mapInstance,
        title: building.building_name,
      });

      marker.addListener("click", () => {
        const vendingInfo = building.vending_machines
          .map(
            (vm) =>
              `<strong>${vm.snack_name || "Unknown"}</strong> (${vm.category || "Unknown"}) - $${vm.price || "N/A"}<br>Status: ${vm.stock_status}`
          )
          .join("<br>");

        infoWindow.setContent(`
          <div>
            <h2>${building.building_name}</h2>
            <p>${vendingInfo}</p>
          </div>
        `);
        infoWindow.open(mapInstance, marker);
      });

      if (!mapInstance.markers) mapInstance.markers = [];
      mapInstance.markers.push(marker);
    });
  };

  const clearMarkers = () => {
    if (map?.markers) {
      map.markers.forEach((marker) => marker.setMap(null));
      map.markers = [];
    }
  };

  const handleBuildingSelection = (selectedOptions) => {
    setSelectedBuildings(selectedOptions || []);
    const selectedNames = selectedOptions?.map((option) => option.value) || [];
    const filteredData = selectedNames.length
      ? mapData.filter((building) => selectedNames.includes(building.building_name))
      : mapData;

    clearMarkers();
    addMarkers(map, filteredData);
  };

  const handleDirections = () => {
    if (directionsRenderer && fromInputRef.current.value && toInputRef.current.value) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: fromInputRef.current.value,
          destination: toInputRef.current.value,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            directionsRenderer.setDirections(result);
          } else {
            console.error("Directions request failed:", status);
          }
        }
      );
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/login" className="nav-link">Log In</a>
        </div>
      </nav>
      <div className={`map-page ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
        {/* Toggle Arrow */}
        <div className="toggle-arrow" onClick={toggleSidebar}>
          {isSidebarOpen ? "<" : ">"}
        </div>
  
        {/* Sidebar */}
        <div className="sidebar">
          {!isSidebarOpen ? (
            // Collapsed Sidebar with Icons Only
            <div className="icon-only">
              <div>
                <img src="/images/building.png" alt="Building Icon" title="Filter by Building" />
              </div>
              <div>
                <img src="/images/direction.png" alt="Directions Icon" title="Directions" />
              </div>
              <div>
                <img src="/images/profile.png" alt="Profile Icon" title="Profile" />
              </div>
              <div>
                <img src="/images/favorite.png" alt="Favorites Icon" title="Favorites" />
              </div>
              <div>
                <img src="/images/logout.png" alt="Log Out Icon" title="Log Out" />
              </div>
            </div>
          ) : (
            // Expanded Sidebar with Full Content
            <>
              <h2>
                <img src="/images/building.png" alt="Building Icon" />
                Filter Snack Location
              </h2>
              <Select
                options={buildings}
                isMulti
                closeMenuOnSelect={false}
                onChange={handleBuildingSelection}
                value={selectedBuildings}
                placeholder="Select Buildings"
              />
              <h2>
                <img src="/images/direction.png" alt="Directions Icon" />
                Directions
              </h2>
              <div className="directions-box">
                <input ref={fromInputRef} type="text" placeholder="From" />
                <input ref={toInputRef} type="text" placeholder="To" />
                <button onClick={handleDirections}>Go</button>
              </div>
  
              {/* Important Links */}
              <div className="important-links">
                <hr className="separator" />
                <a href="/profile">
                  <img src="/images/profile.png" alt="Profile Icon" />
                  Profile
                </a>
                <a href="/favorites">
                  <img src="/images/favorite.png" alt="Favorites Icon" />
                  Favorites
                </a>
                <a href="/logout">
                  <img src="/images/logout.png" alt="Log Out Icon" />
                  Log Out
                </a>
              </div>
            </>
          )}
        </div>
        {/* Map Container */}
        <div className="map-container">
          <div id="map"></div>
        </div>
        <div className="snackID">
            
        </div>
      </div>
    </>
  );  
   
};

export default MapPage;
