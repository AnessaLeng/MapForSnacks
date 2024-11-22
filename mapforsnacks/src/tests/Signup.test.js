import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Signup from '../Signup'; 
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';

// Mock the necessary components and hooks
jest.mock('axios');

describe('Signup Component', () => {
  beforeEach(() => {
    // Mock localStorage and sessionStorage
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
    sessionStorage.setItem = jest.fn();
  });

  test('renders the signup form', () => {
    render(
      <Router>
        <Signup />
      </Router>
    );

    expect(screen.getByPlaceholderText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit/i)).toBeInTheDocument();
  });

  test('submits the form and handles successful signup', async () => {
    const mockResponse = { data: { msg: 'Signup successful!' } };
    axios.post.mockResolvedValue(mockResponse);

    render(
      <Router>
        <Signup />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'Password123' } });

    fireEvent.click(screen.getByText(/Submit/i));

    await waitFor(() => {
      // Expect the flash message to show the success message
      expect(screen.getByText('Signup successful! Please login.')).toBeInTheDocument();
    });
  });

  test('displays error when email is already registered', async () => {
    const mockError = { response: { data: { msg: 'Email already exists' } } };
    axios.post.mockRejectedValue(mockError);

    render(
      <Router>
        <Signup />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'jane.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'Password123' } });

    fireEvent.click(screen.getByText(/Submit/i));

    await waitFor(() => {
      // Expect the error message to show about the existing email
      expect(screen.getByText('This email is already registered. Please use a different one.')).toBeInTheDocument();
    });
  });

  test('displays error if server does not respond', async () => {
    axios.post.mockRejectedValueOnce({ request: {} });

    render(
      <Router>
        <Signup />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'Password123' } });

    fireEvent.click(screen.getByText(/Submit/i));

    await waitFor(() => {
      expect(screen.getByText('No response from server. Please try again later.')).toBeInTheDocument();
    });
  });

  test('handles Google login success', async () => {
    const mockResponse = {
      data: {
        access_token: 'google-token',
        user: { first_name: 'Google', last_name: 'User', email: 'googleuser@example.com' },
      },
    };
    axios.post.mockResolvedValue(mockResponse);

    render(
      <Router>
        <Signup />
      </Router>
    );

    // Simulate Google Login Success
    const mockCredentialResponse = { credential: 'google-id-token' };
    const googleLoginButton = screen.getByText(/Sign in with Google/i); // Adjust based on how it's rendered
    fireEvent.click(googleLoginButton);

    // Trigger success callback
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:5000/api/auth/google-login', {
        idToken: mockCredentialResponse.credential,
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', mockResponse.data.access_token);
      expect(screen.getByText('Google login successful!')).toBeInTheDocument();
    });
  });

  test('displays error on Google login failure', async () => {
    axios.post.mockRejectedValueOnce(new Error('Google login failed'));

    render(
      <Router>
        <Signup />
      </Router>
    );

    const mockCredentialResponse = { credential: 'google-id-token' };
    const googleLoginButton = screen.getByText(/Sign in with Google/i); // Adjust based on how it's rendered
    fireEvent.click(googleLoginButton);

    await waitFor(() => {
      expect(screen.getByText('Google authentication failed.')).toBeInTheDocument();
    });
  });
});