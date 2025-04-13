import '@testing-library/jest-dom'; // Add this import at the top
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WelcomePage from '../WelcomePage';
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import '@testing-library/jest-dom';
describe('Login Failure Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should show error when login fails with invalid credentials', async () => {
    // Mock a failed API response
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    render(
      <MemoryRouter>
        <WelcomePage />
      </MemoryRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'wrong@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'incorrect' }
    });

    // Submit the form
    fireEvent.click(screen.getByText('Login'));

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    
    // Verify token storage was NOT called
    expect(require('../../tokenStorage').storeToken).not.toHaveBeenCalled();
  });
});