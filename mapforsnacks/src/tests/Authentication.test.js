import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../Authentication';
import '@testing-library/jest-dom';

// Mock the localStorage methods
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

// Mocked Test Component to test the hooks
const TestComponent = () => {
  const { isAuthenticated, user, token, login, logout, setError } = useAuth();

  return (
    <div>
      <p>{isAuthenticated ? `Welcome, ${user?.name}` : 'Not logged in'}</p>
      <button onClick={() => login({ name: 'John' }, 'valid_token')}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => setError('Some error')}>Trigger Error</button>
    </div>
  );
};

// Test for initial state from localStorage
test('initial state loads correctly from localStorage', () => {
  // Simulate stored user and token in localStorage
  localStorage.setItem('accessToken', 'mock_token');
  localStorage.setItem('userData', JSON.stringify({ name: 'John' }));

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  // Check if the user is authenticated
  expect(screen.getByText('Welcome, John')).toBeInTheDocument();
});

// Test login functionality
test('should login user and update state correctly', () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  // Click on login button
  fireEvent.click(screen.getByText('Login'));

  // Check if the user is authenticated after login
  expect(screen.getByText('Welcome, John')).toBeInTheDocument();

  // Ensure localStorage is updated
  expect(localStorage.getItem('accessToken')).toBe('valid_token');
  expect(localStorage.getItem('userData')).toBe(JSON.stringify({ name: 'John' }));
});

// Test logout functionality
test('should logout user and clear state and localStorage', () => {
  // Simulate user login by setting values in localStorage
  localStorage.setItem('accessToken', 'mock_token');
  localStorage.setItem('userData', JSON.stringify({ name: 'John' }));

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  // Trigger logout
  fireEvent.click(screen.getByText('Logout'));

  // Ensure user is logged out
  expect(screen.getByText('Not logged in')).toBeInTheDocument();

  // Ensure localStorage is cleared
  expect(localStorage.getItem('accessToken')).toBeNull();
  expect(localStorage.getItem('userData')).toBeNull();
});

// Test error handling
test('should call setError function on error', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  // Trigger error
  fireEvent.click(screen.getByText('Trigger Error'));

  // Check if the error is logged to the console
  expect(consoleErrorSpy).toHaveBeenCalledWith('Error: ', 'Some error');

  consoleErrorSpy.mockRestore(); // Clean up the spy
});