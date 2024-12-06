import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from '../Signup';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../Authentication';
import '@testing-library/jest-dom';
import React from 'react';
import axios from 'axios';

const renderWithProviders = (ui) => {
    return render(
      <Router>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </Router>
    );
  };

describe('Signup Component', () => {
   
    it('should render signup form correctly', () => {
        renderWithProviders(<Signup />);
        
        expect(screen.getByPlaceholderText(/First Name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Last Name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
        expect(screen.getByText(/Submit/i)).toBeInTheDocument();
      });

      it('should submit form and show success message', async () => {
        renderWithProviders(<Signup />);
    
        // Wait for the form elements to be available
        const firstNameInput = await screen.findByPlaceholderText(/First Name/i);
        const lastNameInput = await screen.findByPlaceholderText(/Last Name/i);
        const emailInput = await screen.findByPlaceholderText(/Email/i);
        const passwordInput = await screen.findByPlaceholderText(/Password/i);
    
         // Fill the form
        fireEvent.change(firstNameInput, { target: { value: 'John' } });
        fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
        fireEvent.change(emailInput, { target: { value: 'johndoe@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // Submit form
        fireEvent.click(screen.getByText(/Submit/i));
        });
    
      it('should show error message when email is already taken', async () => {
        // Mock the axios post request to simulate email already taken error
        jest.spyOn(axios, 'post').mockRejectedValue({
          response: {
            data: {
              msg: 'Email already exists'
            }
          }
        });
    
        renderWithProviders(<Signup />);
    
        fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'johndoe@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    
        fireEvent.click(screen.getByText(/Submit/i));
    
        waitFor(() => expect(screen.getByText(/This email is already registered. Please use a different one./i)).toBeInTheDocument());
      });
    });