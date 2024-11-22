import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../Authentication';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock localStorage to avoid actually storing items in it during tests
beforeEach(() => {
  Storage.prototype.setItem = jest.fn();
  Storage.prototype.getItem = jest.fn();
  Storage.prototype.removeItem = jest.fn();
});

const TestComponent = () => {
  const { isAuthenticated, user, token, login, logout } = useAuth();

  return (
    <div>
      <div>{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      {user && <div>{`Welcome, ${user.first_name}`}</div>}
      {token && <div>{`Token: ${token}`}</div>}
      <button onClick={() => login({ first_name: 'John', last_name: 'Doe' }, 'test-token')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  test('should initialize with correct authentication state', () => {
    // Simulate that a token is present in localStorage
    localStorage.getItem.mockReturnValue('existing-token');

    render(
      <Router>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </Router>
    );

    // Assert the initial state reflects authentication status
    expect(screen.getByText(/Authenticated/)).toBeInTheDocument();
    expect(screen.getByText(/Token: existing-token/)).toBeInTheDocument();
    expect(screen.getByText(/Welcome, John/)).toBeInTheDocument();
  });

  test('should handle login correctly', () => {
    render(
      <Router>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </Router>
    );

    // Click the login button
    fireEvent.click(screen.getByText(/Login/i));

    // Check if the state updates correctly
    expect(screen.getByText(/Authenticated/)).toBeInTheDocument();
    expect(screen.getByText(/Welcome, John/)).toBeInTheDocument();
    expect(screen.getByText(/Token: test-token/)).toBeInTheDocument();
    
    // Ensure localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'test-token');
  });

  test('should handle logout correctly', () => {
    // Simulate logged-in state by mocking localStorage
    localStorage.getItem.mockReturnValue('existing-token');
    
    render(
      <Router>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </Router>
    );

    // Click the logout button
    fireEvent.click(screen.getByText(/Logout/i));

    // Check that the state has been reset to unauthenticated
    expect(screen.getByText(/Not Authenticated/)).toBeInTheDocument();
    expect(screen.queryByText(/Welcome, John/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Token: test-token/)).not.toBeInTheDocument();

    // Ensure localStorage was cleared
    expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('userData');
  });

  test('should load authenticated state from localStorage on reload', () => {
    // Simulate existing token in localStorage
    localStorage.getItem.mockReturnValue('existing-token');
    
    render(
      <Router>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </Router>
    );

    // Check that the user is authenticated based on localStorage
    expect(screen.getByText(/Authenticated/)).toBeInTheDocument();
    expect(screen.getByText(/Token: existing-token/)).toBeInTheDocument();
  });

  test('should call setError on login failure', () => {
    // Mock the setError function
    const mockSetError = jest.fn();

    render(
      <Router>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </Router>
    );

    // Simulate an error during login
    const { login } = useAuth();
    act(() => {
      login(null, null);
    });

    // Check that the error function was called
    expect(mockSetError).toHaveBeenCalledWith("No valid token found.");
  });
});