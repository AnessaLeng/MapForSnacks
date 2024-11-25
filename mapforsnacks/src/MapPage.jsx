import React, { useEffect, useState, useRef } from "react";
import Select from "react-select";
import axios from 'axios';
import './MapPage.css';
import { fetchBuildings, fetchVendingMachines, fetchSnacks, saveSearchHistory, fetchSearchHistory } from "./api/api";


// Importing images
import helpIcon from './images/question.png';
import feedbackIcon from './images/feedback.png';

const MapPage = () => {
    const [map, setMap] = useState(null);
    const [buildings, setBuildings] = useState([]);
    const [selectedBuildings, setSelectedBuildings] = useState([]);
    const [mapData, setMapData] = useState([]);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar toggle state
    const [markers, setMarkers] = useState([]);
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

          loadData();

          const loadSearchHistory = async () => {
            try {
              const history = await fetchSearchHistory();
              saveSearchHistory(history);
            } catch (error) {
              console.error("Error fetching search history:", error);
            }
          };
          
          loadGoogleMapsScript();
          //loadData();
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
            const newMarkers = [];
            data.forEach((building) => {
              const marker = new window.google.maps.Marker({
                position: { lat: building.lat, lng: building.lng },
                map: mapInstance,
                title: building.building_name,
              });
              newMarkers.push(marker);

              const favoritesButton = `
                <button id="favorite-btn" style="margin-top: 10px; background-color: #256BDB; color: white; padding: 8px; border-radius: 5px; cursor: pointer;">
                Add to Favorites
                </button>
            `;
        
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
            setMarkers(newMarkers);
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

            // Save the filter search to history
            selectedNames.forEach(buildingName => {
                const building = mapData.find(b => b.building_name === buildingName);
                if (building) {
                    building.vending_machines.forEach(vm => {
                        handleSearchHistory({
                            building_name: buildingName,
                            from: fromInputRef.current.value,
                            to: toInputRef.current.value,
                        });
                    });
                }
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
                }
              );
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
                            offering: machine.Offering,
                            image: machine.Image,
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
                console.log('Search history logged!');
            } else {
                const errorData = await response.json();
                console.error('Failed to save search history:', errorData.message);
            }
        } catch (error) {
            console.error('Error logging search history:', error);
        }
    };

    return (
        <>
          <div className={`map-page ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}>
            <div className="toggle-arrow" onClick={toggleSidebar}>
              {isSidebarOpen ? "<" : ">"}
            </div>
            <div className="sidebar">
              {isSidebarOpen && (
                <>
                  <h2>Filter by Location or Snack</h2>
                  <Select
                    options={buildings}
                    isMulti
                    closeMenuOnSelect={false}
                    onChange={handleBuildingSelection}
                    value={selectedBuildings}
                    placeholder="Select Buildings"
                  />
                  <div className="directions-box">
                    <h3>Get Directions</h3>
                    <input ref={fromInputRef} type="text" placeholder="From" />
                    <input ref={toInputRef} type="text" placeholder="To" />
                    <button onClick={handleDirections}>Go</button>
                  </div>
                </>
              )}
            </div>
            <div className="map-container">
              <div id="map"></div>
            </div>
          </div>
        </>
      );
    };
    
    export default MapPage;