//imports
import React, { useEffect, useState } from 'react';
import './mockdata.css'; //stylesheet

//State Variables for the building, snack, and machine data
const MockData = () => {
  const [buildings, setBuildings] = useState([]);
  const [snacks, setSnacks] = useState([]);
  const [machines, setMachines] = useState([]);

  // Fetch buildings data from API
  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/buildings');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setBuildings(data); //updates the state with building data
      } catch (error) {
        console.error('Error fetching buildings:', error);
      }
    };
    fetchBuildings();
  }, []);

  // Fetch snacks data from API
  useEffect(() => {
    const fetchSnacks = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/snacks');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setSnacks(data); //updates the state with the snack data
      } catch (error) {
        console.error('Error fetching snacks:', error);
      }
    };
    fetchSnacks();
  }, []);

  // Fetch machine data from API
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/machine');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setMachines(data);  //updates the state with machine data
      } catch (error) {
        console.error('Error fetching machine data:', error);
      }
    };
    fetchMachines();
  }, []);

  return (
    <div className="mock-data-list">
      <h2>Available Buildings</h2>
      <table>
        <thead>
          <tr>
            <th>Building ID</th> 
            <th>Building Name</th>
          </tr>
        </thead>
        <tbody>
          {buildings.map((building) => (
            <tr key={building.building_id}>
              <td>{building.building_id}</td>
              <td>{building.building_name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Available Snacks</h2>
      <table>
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

      <h2>Machine Inventory</h2>
      <table>
        <thead>
          <tr>
            <th>Machine Vending ID</th>
            <th>Snack ID</th>
            <th>Quantity</th>
            <th>Stock Status</th>

          </tr>
        </thead>
        <tbody>
          {machines.map((machine) => (
            <tr key={`${machine.vending_id}-${machine.snack_id}`}>
              <td>{machine.vending_id}</td>
              <td>{machine.snack_id}</td>
              <td>{machine.quantity}</td>
              <td>{machine.stock_status}</td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MockData;















