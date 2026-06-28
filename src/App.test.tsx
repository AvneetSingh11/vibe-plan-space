import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';

// Mock Google Login to avoid context errors in tests
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <div data-testid="google-login-mock">Mock Google Login</div>,
}));

describe('Vibe Plan Space Application', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  it('renders the Dashboard by default and shows "Guest User"', () => {
    render(<App />);
    expect(screen.getAllByText(/Vibe Plan Space/i).length).toBeGreaterThan(0);
    
    // Check for default Guest User
    expect(screen.getByText(/Guest User/i)).toBeInTheDocument();
    
    // Check if Dashboard section is visible
    expect(screen.getByText(/Today's Prime Objectives/i)).toBeInTheDocument();
  });

  it('can open and close the mobile menu', async () => {
    render(<App />);
    
    // Find the hamburger menu toggle (material-symbols-outlined containing 'menu')
    const toggleButton = screen.getAllByRole('button').find(btn => btn.textContent === 'menu');
    expect(toggleButton).toBeInTheDocument();
    
    // Click to open menu
    if (toggleButton) {
      await userEvent.click(toggleButton);
    }
    
    // Menu should now contain 'close' icon
    expect(screen.getByText('close')).toBeInTheDocument();
  });

  it('can add a new task and it appears in the list', async () => {
    render(<App />);
    
    // Find the task input
    const taskInput = screen.getByPlaceholderText(/Type override command/i);
    expect(taskInput).toBeInTheDocument();

    // Type a new task and submit
    await userEvent.type(taskInput, 'Write Unit Tests{enter}');

    // Task should appear in the document
    expect(screen.getByText('Write Unit Tests')).toBeInTheDocument();
  });

  it('switches to the Matrix tab when clicked', async () => {
    render(<App />);
    
    const matrixTab = screen.getByRole('button', { name: /Matrix/i });
    await userEvent.click(matrixTab);

    // Matrix view should contain quadrants
    expect(screen.getByText(/Do First/i)).toBeInTheDocument();
    expect(screen.getByText(/Schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/Delegate/i)).toBeInTheDocument();
    expect(screen.getByText(/Declutter/i)).toBeInTheDocument();
  });

  it('switches to the Habits tab and allows adding a habit', async () => {
    render(<App />);
    
    const habitsTab = screen.getByRole('button', { name: /Habits/i });
    await userEvent.click(habitsTab);

    // Habits view should be active
    expect(screen.getByText(/Vibe Vault/i)).toBeInTheDocument();

    const habitInput = screen.getByPlaceholderText(/Initialize new behavior.../i);
    await userEvent.type(habitInput, 'Drink Water{enter}');

    expect(screen.getByText('Drink Water')).toBeInTheDocument();
  });
});
