import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../Authentication';
import Profile from '../Profile';
import axios from 'axios';
import React from 'react';

// Mocking external modules
jest.mock('axios');

describe('Profile Page', () => {

  // Render the Profile component with necessary providers
  const renderProfilePage = (authContextValue) => {
    render(
      <Router>
        <AuthProvider value={authContextValue}>
          <Profile />
        </AuthProvider>
      </Router>
    );
  };

  it('renders the profile page when authenticated', async () => {
    // Mocking a successful API response for profile data
    axios.get.mockResolvedValueOnce({
      data: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
      },
    });

    const authContextValue = {
      isAuthenticated: true,
      googleId: null,
      user: { first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' },
      logout: jest.fn(),
    };

    renderProfilePage(authContextValue);

    expect(screen.getByText(/John Doe's Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/john.doe@example.com/i)).toBeInTheDocument();
  });

  it('redirects to login if user is not authenticated', () => {
    const authContextValue = {
      isAuthenticated: false,
      googleId: null,
      user: null,
      logout: jest.fn(),
    };

    renderProfilePage(authContextValue);

    expect(screen.getByText(/You must log in first/i)).toBeInTheDocument();
  });

  it('fetches and displays favorites', async () => {
    // Mocking a successful API response for favorites
    axios.get.mockResolvedValueOnce({ data: { favorites: [{ id: 1, building_name: 'Building A', lat: 12.34, lng: 56.78, timestamp: '2024-01-01T12:00:00Z' }] } });

    const authContextValue = {
      isAuthenticated: true,
      googleId: null,
      user: { first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' },
      logout: jest.fn(),
    };

    renderProfilePage(authContextValue);

    await waitFor(() => {
      expect(screen.getByText(/Building A/i)).toBeInTheDocument();
      expect(screen.getByText(/Latitude: 12.34, Longitude: 56.78/i)).toBeInTheDocument();
    });
  });

  it('handles error when fetching favorites', async () => {
    axios.get.mockRejectedValueOnce(new Error('Error fetching favorites'));

    const authContextValue = {
      isAuthenticated: true,
      googleId: null,
      user: { first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' },
      logout: jest.fn(),
    };

    renderProfilePage(authContextValue);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load search history/i)).toBeInTheDocument();
    });
  });

  it('handles logout and redirects to login page', async () => {
    const authContextValue = {
      isAuthenticated: true,
      googleId: null,
      user: { first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' },
      logout: jest.fn(),
    };

    renderProfilePage(authContextValue);

    fireEvent.click(screen.getByText(/Logout/i));

    expect(authContextValue.logout).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/You must log in first/i)).toBeInTheDocument();
  });

  it('displays error message when no profile data is returned', async () => {
    axios.get.mockRejectedValueOnce(new Error('Profile data not found'));

    const authContextValue = {
      isAuthenticated: true,
      googleId: null,
      user: { first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' },
      logout: jest.fn(),
    };

    renderProfilePage(authContextValue);

    await waitFor(() => {
      expect(screen.getByText(/Error loading profile or user not authorized/i)).toBeInTheDocument();
    });
  });

});