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

    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
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

  test('should direct straight to "About Us" section when "About Us" button is clicked', () => {
    render(
      <MemoryRouter>
        <MainPage/>
      </MemoryRouter>
    );
  
    const direct= jest.fn();
    const aboutButtons = screen.queryAllByText('About Us');
    window.HTMLElement.prototype.scrollIntoView = direct;
    fireEvent.click(aboutButtons[0]);
    expect(direct).toHaveBeenCalledTimes(1);
  });
  
  console.warn = (message) => {
    if (message.includes('React Router Future Flag Warning')) return;
    console.info(message);
  };
});

