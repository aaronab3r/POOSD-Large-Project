import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WelcomePage from './WelcomePage';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock the fetch API
global.fetch = jest.fn() as jest.Mock;

// Mock the tokenStorage module
jest.mock('../tokenStorage.tsx', () => ({
  storeToken: jest.fn(),
}));

// Mock the jwtDecode function
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

describe('WelcomePage Login Functionality', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should show error when no credentials are provided', async () => {
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    );

    // Click the "Get started" button to show auth form
    fireEvent.click(screen.getByText('Get started'));
    
    // Click the login button without entering any credentials
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Please enter email/username and password.')).toBeInTheDocument();
    });
  });

  it('should show error for invalid email format', async () => {
    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    );

    // Click the "Get started" button to show auth form
    fireEvent.click(screen.getByText('Get started'));
    
    // Enter invalid email
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    // Enter password
    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Click login button
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address!')).toBeInTheDocument();
    });
  });

  it('should show error when login fails', async () => {
    // Mock a failed login response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    );

    // Click the "Get started" button to show auth form
    fireEvent.click(screen.getByText('Get started'));
    
    // Enter valid credentials
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    
    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    // Click login button
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should show error when server connection fails', async () => {
    // Mock a network error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    );

    // Click the "Get started" button to show auth form
    fireEvent.click(screen.getByText('Get started'));
    
    // Enter valid credentials
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    
    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
    
    // Click login button
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('Failed to connect to the server. Please check your connection and try again.')).toBeInTheDocument();
    });
  });

  it('should show error when no access token is received', async () => {
    // Mock a successful response without access token
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}), // No access token
    });

    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    );

    // Click the "Get started" button to show auth form
    fireEvent.click(screen.getByText('Get started'));
    
    // Enter valid credentials
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
    
    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
    
    // Click login button
    fireEvent.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByText('No access token received')).toBeInTheDocument();
    });
  });
});