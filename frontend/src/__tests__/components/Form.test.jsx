import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Form from '../../components/Form';
import { authAPI } from '../../api';

// Mock the API calls
jest.mock('../../api', () => ({
    authAPI: {
        login: jest.fn(),
        register: jest.fn(),
    },
}));

const renderForm = (method) => {
    render(
        <BrowserRouter>
            <Form method={method} />
        </BrowserRouter>
    );
};

describe('Form Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Login Form', () => {
        test('renders login form correctly', () => {
            renderForm('login');
            expect(screen.getByText('Login')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        });

        test('handles login submission', async () => {
            authAPI.login.mockResolvedValueOnce({ data: { access: 'token', refresh: 'refresh' } });
            renderForm('login');

            fireEvent.change(screen.getByPlaceholderText('Username'), {
                target: { value: 'testuser' },
            });
            fireEvent.change(screen.getByPlaceholderText(/password/i), {
                target: { value: 'password123' },
            });
            fireEvent.click(screen.getByRole('button', { name: /login/i }));

            await waitFor(() => {
                expect(authAPI.login).toHaveBeenCalledWith({
                    username: 'testuser',
                    password: 'password123',
                });
            });
        });

        test('displays error message on login failure', async () => {
            authAPI.login.mockRejectedValueOnce({ 
                response: { data: { detail: 'Invalid credentials' } } 
            });
            renderForm('login');

            fireEvent.click(screen.getByRole('button', { name: /login/i }));

            await waitFor(() => {
                expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
            });
        });
    });

    describe('Registration Form', () => {
        test('renders registration form correctly', () => {
            renderForm('register');
            expect(screen.getByText('Sign Up')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
            expect(screen.getAllByPlaceholderText(/password/i)).toHaveLength(2);
        });

        test('validates matching passwords', async () => {
            renderForm('register');

            const passwordInput = screen.getByPlaceholderText(/^password/i);
            const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i);

            fireEvent.change(passwordInput, {
                target: { value: 'password123' },
            });
            fireEvent.change(confirmPasswordInput, {
                target: { value: 'password124' },
            });
            fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

            await waitFor(() => {
                expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
            });
        });
    });
}); 