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
