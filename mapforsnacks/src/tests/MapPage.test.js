import {render, fireEvent, waitFor, screen} from "@testing-library/react";
import '@testing-library/jest-dom';
import MapPage from "../MapPage";
import {fetchBuildings, fetchVendingMachines, fetchSnacks} from "../api/api";
import {AuthProvider} from "../Authentication";
import {MemoryRouter} from "react-router-dom";
import React from 'react';

jest.mock("../api/api");

describe('MapPage Tests', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should render MapPage correctly", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <MapPage/>
        </AuthProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(fetchBuildings).toHaveBeenCalledTimes(1));
    expect(fetchBuildings).toHaveBeenCalled();
    const filterText = screen.getByText(/Filter.*Location/i);
    expect(filterText).toBeInTheDocument();
  });
  
  test("should load Google Maps script on page load", () => {
    const script = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    expect(script).toBeInTheDocument();
  });

  test("should fetch vending machines data successfully", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <MapPage/>
        </AuthProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(fetchVendingMachines).toHaveBeenCalledTimes(1));
    expect(fetchVendingMachines).toHaveBeenCalled();
  });

  test("should fetch snacks data sucessfully", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <MapPage/>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchSnacks).toHaveBeenCalledTimes(1));
    expect(fetchSnacks).toHaveBeenCalled();
  });

  test("should fetch building data successfully", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <MapPage/>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchBuildings).toHaveBeenCalledTimes(1));
    expect(fetchBuildings).toHaveBeenCalled();
  });

  test("should fetch buildings and vending machines data successfully", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <MapPage/>
        </AuthProvider>
      </MemoryRouter>
    );
  
    await waitFor(() => expect(fetchBuildings).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(fetchVendingMachines).toHaveBeenCalledTimes(1));
    expect(fetchBuildings).toHaveBeenCalled();
    expect(fetchVendingMachines).toHaveBeenCalled();
    // expect(fetchSnacks).toHaveBeenCalled();
  });

  test("should combine and load data correctly", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <MapPage/>
        </AuthProvider>
      </MemoryRouter>
    );
  
    await waitFor(() => expect(fetchBuildings).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(fetchVendingMachines).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(fetchSnacks).toHaveBeenCalledTimes(1));
    expect(fetchBuildings).toHaveBeenCalled();
    expect(fetchVendingMachines).toHaveBeenCalled();
    expect(fetchSnacks).toHaveBeenCalled();
  });

  test('should show autocomplete suggestions when typing', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <MapPage/>
        </AuthProvider>
      </MemoryRouter>
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input,{target:{value: 'Snacks'}});
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());
  });

  test("should clear markers when deselected", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <MapPage/>
        </AuthProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(fetchBuildings).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByRole('combobox'));
    expect(screen.queryByTestId("marker")).not.toBeInTheDocument();
  });

  test("should be able to set building names and their locations", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <MapPage/>
        </AuthProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(fetchBuildings).toHaveBeenCalledTimes(1));
  });

  test("should toggle sidebar open and closed", () => {
    const { getByText } = render(
      <MemoryRouter>
        <AuthProvider>
          <MapPage/>
        </AuthProvider>
      </MemoryRouter>
    );
    expect(getByText("<")).toBeInTheDocument();
    fireEvent.click(getByText("<"));
    expect(getByText(">")).toBeInTheDocument();
    fireEvent.click(getByText(">"));
    expect(getByText("<")).toBeInTheDocument();
  });

  console.warn = (message) => {
    if (message.includes('React Router Future Flag Warning')) return;
    console.info(message);
  };
});
