import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './Authentication';
import Select from "react-select";
import axios from 'axios';
import './MapPage.css';
import { fetchBuildings, fetchVendingMachines, fetchSnacks, saveSearchHistory, fetchSearchHistory } from "./api/api";

const MapPage = () => {
    const { isAuthenticated, logout } = useAuth();
    const [map, setMap] = useState(null);
    const [buildings, setBuildings] = useState([]);
    const [selectedBuildings, setSelectedBuildings] = useState([]);
    const [mapData, setMapData] = useState([]);
    const [snackData, setSnackData] = useState([]);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar toggle state
    const fromInputRef = useRef(null);
    const toInputRef = useRef(null);

    const navigate = useNavigate();

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
                    vending_machines: vendingMachines.filter((vm) =>
                    building.vending_id?.includes(vm.vending_id)
                    ),
                }));

                setMapData(combinedData);
                setSnackData(snacks);
                setBuildings(
                    buildings.map((building) => ({
                    label: building.building_name, // Only the building name
                    value: building.building_name,
                    }))
                );
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };
        
        const loadSearchHistory = async () => {
            try {
                const history = await fetchSearchHistory();
                saveSearchHistory(history);
            } catch (error) {
                console.error("Error fetching search history:", error);
            }
        };
           
        loadGoogleMapsScript();
        loadData();
        loadSearchHistory();
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
                script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
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

                const favoritesButton = `
                    <button id="favorite-btn" style="margin-top: 10px; background-color: #256BDB; color: white; padding: 8px; border-radius: 5px; cursor: pointer;">
                    Add to Favorites
                    </button>
                `;
            
                marker.addListener("click", () => {
                    infoWindow.setContent(`
                        <div>
                            <h2>${building.building_name}</h2>
                            <p><strong>Vending IDs:</strong> ${building.vending_id || "None"}</p>
                            <p><strong>Floor:</strong> ${building.floor || "Unknown"}</p>
                            <p><strong>Offerings:</strong> ${building.Offering || "Unknown"}</p>
                            ${favoritesButton}
                        </div>
                    `);
                    infoWindow.open(mapInstance, marker);
                    const favoriteBtn = document.getElementById("favorite-btn");
                    if (favoriteBtn) {
                        favoriteBtn.onclick = () => {
                            console.log('Add to Favorites clicked!');
                            handleAddFavorite(building); // Add favorite when the button is clicked
                            infoWindow.close();
                        };
                    }
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

            selectedNames.forEach(building_name => {
                handleSearchHistory({
                    building_name: building_name,
                });
            });
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

                        // Save the directions search to history
                        handleSearchHistory({
                            from: fromInputRef.current.value,
                            to: toInputRef.current.value,
                        });

                    } else {
                        console.error("Directions request failed:", status);
                    }
                });
            }
        };
        
        const toggleSidebar = () => {
            setIsSidebarOpen(!isSidebarOpen);
        };

        const handleAddFavorite = async (machine) => {
            const token = localStorage.getItem('authToken');
            try {
                const response = await axios.post('http://localhost:5000/api/user/favorites', 
                        { machine },
                        { headers: { Authorization: `Bearer ${token}` },  
                            body: JSON.stringify({
                                lat: machine.lat,
                                lng: machine.lng,
                                building_name: machine.location,
                                vending_id: machine.vending_id,
                                floor: machine.floor,
                                offering: machine.Offering
                            }),
                });
                if (response.status === 200) {
                    console.log('Added to favorites!');
                } else {
                    const errorData = await response.json();
                    console.error('Failed to add to favorites:', errorData.message);
                }
            } catch (error) {
                console.error('Error adding to favorites:', error);
            }
        };

        const handleSearchHistory = async (data) => {
            const token = localStorage.getItem('authToken');
            try {
                // Send the search query to the backend to save it in the database
                const response = await axios.post('http://127.0.0.1:5000/search_history', 
                    data,
                    {
                        headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
        
                if (response.status === 200) {
                    console.log('Search history logged!: ' + data);
                } else {
                    const errorData = await response.json();
                    console.error('Failed to save search history:', errorData.message);
                }
            } catch (error) {
                console.error('Error logging search history:', error);
            }
        };

        const handleLogout = () => {
            logout();
            navigate('/login');  // Redirect to login page after logout
        };

    return (
        <>
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
            <nav className="navbar">
            <ul className="navbar-list">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/map">Map</Link></li>
                {!isAuthenticated ? (
                    <>
                        <li><Link to="/signup">Signup</Link></li>
                        <li><Link to="/login">Login</Link></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/profile">Profile</Link></li>
                        <li><button onClick={logout}>Logout</button></li>
                    </>
                )}
            </ul>
            </nav>
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
                <Link to="/profile">
                    <img src="/images/profile.png" alt="Profile Icon" />
                    Profile
                </Link>
                <Link to="/favorites">
                    <img src="/images/favorite.png" alt="Favorites Icon" />
                    Favorites
                </Link>
                <button onClick={handleLogout}>
                    <img src="/images/logout.png" alt="Log Out Icon" />
                    Log Out
                </button>
            </div>
            </>
        )}
        </div>
        {/* Map Container */}
        <div className="map-container">
            <div id="map"></div>
        </div>
        <div className="snack-table-container">
          <h2>Snack Table</h2>
          <table>
            <thead>
              <tr>
                <th className="snack-id">Snack ID</th>
                <th>Snack Name</th>
                <th>Category</th>
                <th className="price">Price</th>
              </tr>
            </thead>
            <tbody>
              {snackData.map((snack) => (
                <tr key={snack.snack_id}>
                  <td className="snack-id">{snack.snack_id}</td>
                  <td>{snack.snack_name}</td>
                  <td>{snack.category}</td>
                  <td className="price">${snack.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
    </>
    );
    };
    
    export default MapPage;