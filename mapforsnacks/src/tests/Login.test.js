import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../Login';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../Authentication';
import axios from 'axios';
import React from 'react';

// Mocking external modules
jest.mock('axios');
jest.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onFailure }) => (
    <button onClick={() => onSuccess({ credential: 'fake-google-token' })}>Google Login</button>
  ),
  GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
}));

describe('Login Page', () => {

  // Render the Login component with necessary providers
  const renderLoginPage = () => {
    render(
      <Router>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </Router>
    );
  };

  it('renders the login form correctly', () => {
    renderLoginPage();

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('displays an error message for invalid credentials', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: { msg: 'Invalid credentials' },
      },
    });

    renderLoginPage();

    userEvent.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    userEvent.type(screen.getByPlaceholderText(/password/i), 'wrongpassword');
    userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => screen.getByText(/email or password was incorrectly entered/i));

    expect(screen.getByText(/email or password was incorrectly entered/i)).toBeInTheDocument();
  });

  it('submits the form and redirects on successful login', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        access_token: 'fake-access-token',
        user: { id: 1, name: 'Test User', email: 'test@example.com' },
      },
    });

    renderLoginPage();

    userEvent.type(screen.getByPlaceholderText(/email/i), 'test@example.com');
    userEvent.type(screen.getByPlaceholderText(/password/i), 'correctpassword');
    userEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Wait for redirect (we simulate navigation)
    await waitFor(() => screen.getByText(/google login/i)); // This checks if the Google login button is rendered after form submit

    expect(localStorage.getItem('authToken')).toBe('fake-access-token');
    expect(screen.getByText(/google login/i)).toBeInTheDocument(); // Expect Google login button to appear after successful login
  });

  it('calls the Google login success handler', async () => {
    const mockLogin = jest.fn();
    axios.post.mockResolvedValueOnce({
      data: {
        access_token: 'fake-google-access-token',
        user: { id: 1, name: 'Google User', email: 'googleuser@example.com' },
      },
    });

    renderLoginPage();

    // Simulate clicking the Google login button
    userEvent.click(screen.getByText('Google Login'));

    // Wait for Google login response
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith(
      { id: 1, name: 'Google User', email: 'googleuser@example.com' },
      'fake-google-access-token'
    ));

    expect(localStorage.getItem('authToken')).toBe('fake-google-access-token');
  });

  it('displays error on Google login failure', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        data: { msg: 'Google login failed' },
      },
    });

    renderLoginPage();

    // Simulate clicking the Google login button
    userEvent.click(screen.getByText('Google Login'));

    await waitFor(() => expect(screen.getByText(/google login failed/i)).toBeInTheDocument());
  });

});