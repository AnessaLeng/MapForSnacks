import {render, screen, fireEvent} from '@testing-library/react';
import {MemoryRouter,useNavigate} from 'react-router-dom';
import MainPage from '../MainPage';
import '@testing-library/jest-dom';

import {useAuth} from '../Authentication';// for mocking useAuth
import React from 'react';

jest.mock('../Authentication', () => ({
    useAuth: jest.fn(() => ({
      isAuthenticated:false,
      login: jest.fn(),
      logout: jest.fn(),
    })),
}));

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
  }));
  

describe('MainPage Tests', () => {
  test('should render the website with its title', () => {
    render(
      <MemoryRouter>
        <MainPage/>
      </MemoryRouter>
    );
    expect(screen.getByText('MAP FOR SNACKS')).toBeInTheDocument();
  });

  test('should display "Log in" and "Sign up" links when the user is not authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated:false});
    render(
      <MemoryRouter>
        <MainPage/>
      </MemoryRouter>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Signup')).toBeInTheDocument();
  });

  test('should display "Profile" and "Logout" button when the user is authenticated', () => {
    useAuth.mockReturnValue({isAuthenticated:true,login:jest.fn(),logout:jest.fn()});
    render(
      <MemoryRouter>
        <MainPage/>
      </MemoryRouter>
    );

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });
  
  console.warn = (message) => {
    if (message.includes('React Router Future Flag Warning')) return;
    console.info(message);
  };
});

