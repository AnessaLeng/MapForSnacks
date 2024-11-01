import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';
import { AuthProvider } from '../content/Authentication';

test('renders the dropdown menu and links', () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );

  const dropdownTrigger = screen.getByAltText(/dropdown_icon/i);
  expect(dropdownTrigger).toBeInTheDocument();

  act(() => {
    fireEvent.click(dropdownTrigger);
  });

  const homeLink = screen.getByText(/Home/i);
  const mapLink = screen.getByText(/Map/i);
  const signupLink = screen.getByText(/Signup/i);
  const profileLink = screen.getByText(/Profile/i);

  expect(homeLink).toBeInTheDocument();
  expect(mapLink).toBeInTheDocument();
  expect(signupLink).toBeInTheDocument();
  expect(profileLink).toBeInTheDocument();
});

test('navigates to the main page on initial render', () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );

  const mainPageTitle = screen.getByText(/Welcome to MapForSnacks/i);
  expect(mainPageTitle).toBeInTheDocument();
});