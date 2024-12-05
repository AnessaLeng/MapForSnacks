import { fetchBuildings, fetchVendingMachines, fetchSnacks } from '../api/api';

describe('API Tests', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    console.error = jest.fn();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('fetchBuildings should fetch buildings successfully', async () => {
    const mockBuildings = [{ id: 1, name: 'Building A' }];
    fetch.mockResolvedValueOnce({ok: true,json: jest.fn().mockResolvedValueOnce(mockBuildings),});
    const val = await fetchBuildings();
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5000/api/buildings');
    expect(val).toEqual(mockBuildings);
    expect(console.error).not.toHaveBeenCalled();
  });

  test('fetchVendingMachines should fetch vending machines successfully', async () => {
    const mockMachines = [{id: 1, name: 'Vending Machine A'}];
    fetch.mockResolvedValueOnce({ok:true,json:jest.fn().mockResolvedValueOnce(mockMachines),});
    const val = await fetchVendingMachines();
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5000/api/vending-machines');
    expect(val).toEqual(mockMachines);
    expect(console.error).not.toHaveBeenCalled(); 
  });

  test('fetchSnacks should fetch snacks successfully', async () => {
    const mockSnacks = [{ id: 1, name: 'Pringles' }];
    fetch.mockResolvedValueOnce({ok:true,json:jest.fn().mockResolvedValueOnce(mockSnacks),});
    const val = await fetchSnacks();
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5000/api/snacks');
    expect(val).toEqual(mockSnacks);
    expect(console.error).not.toHaveBeenCalled(); 
  });

  test('fetchBuildings should handle fetch failure', async () => {
    fetch.mockResolvedValueOnce({ok: false});
    const val = await fetchBuildings();
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5000/api/buildings');
    expect(val).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  test('fetchVendingMachines should handle fetch failure', async () => {
    fetch.mockResolvedValueOnce({ok: false});
    const  val = await fetchVendingMachines();
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5000/api/vending-machines');
    expect(val).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  test('fetchSnacks should handle fetch failure', async () => {
    fetch.mockResolvedValueOnce({ok:false});
    const val = await fetchSnacks();
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5000/api/snacks');
    expect(val).toEqual([]);
    expect(console.error).toHaveBeenCalled(); 
  });
  
  console.warn = (message) => {
    if (message.includes('React Router Future Flag Warning')) return;
    console.info(message); 
  };
  
});