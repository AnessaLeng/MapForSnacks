import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../features/Login/Login';
import { AuthProvider } from '../features/Authentication/Authentication';
import { MemoryRouter } from 'react-router-dom'; // Import MemoryRouter to mock routing
import '@testing-library/jest-dom';
import React from 'react';

// Utility function to render the component with the AuthProvider
const renderWithAuthProvider = (ui) => {
    return render(
        <MemoryRouter>
          <AuthProvider>{ui}</AuthProvider>
        </MemoryRouter>
      );
  };

test('should render login form correctly', () => {
    renderWithAuthProvider(<Login />);
  
  // Check if the basic elements are present
  expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  expect(screen.getByText('Submit')).toBeInTheDocument();
});

test('should submit form', async () => {
    renderWithAuthProvider(<Login />);

  // Fill in the form fields
  fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

  // Submit the form
  fireEvent.click(screen.getByText('Submit'));
});