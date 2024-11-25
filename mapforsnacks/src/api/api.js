export const fetchBuildings = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/buildings');
      if (!response.ok) throw new Error('Failed to fetch buildings');
      return await response.json();
    } catch (error) {
      console.error('Error fetching buildings:', error);
      return [];
    }
  };
  
  export const fetchVendingMachines = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/vending-machines');
      if (!response.ok) throw new Error('Failed to fetch vending machines');
      return await response.json();
    } catch (error) {
      console.error('Error fetching vending machines:', error);
      return [];
    }
  };
  
  export const fetchSnacks = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/snacks");
      if (!response.ok) throw new Error("Failed to fetch snacks");
      return await response.json();
    } catch (error) {
      console.error("Error fetching snacks:", error);
      return [];
    }
  };

  export const saveSearchHistory = async (data) => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch("http://127.0.0.1:5000/api/search_history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`  // Add token for authentication
          },
          body: JSON.stringify(data),  // Sending the data as JSON
        });
      if (!response.ok) throw new Error("Failed to save search history");
      return await response.json();
    } catch (error) {
      console.error("Error saving search history:", error);
      return [];
    }
  };

  export const fetchSearchHistory = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await fetch("http://127.0.0.1:5000/api/search_history", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`  // Add token for authentication
          },
        });
      if (!response.ok) throw new Error("Failed to fetch search history");
      const history = await response.json();

      return history.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp),  // Convert timestamp to Date object
      }));
    } catch (error) {
      console.error("Error fetching search history", error);
      return [];
    }
  };