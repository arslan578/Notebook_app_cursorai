import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import { jwtDecode } from 'jwt-decode';

jest.mock('jwt-decode');

describe('ProtectedRoute Component', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('redirects to login when no token present', () => {
        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </BrowserRouter>
        );

        expect(window.location.pathname).toBe('/login');
    });

    test('renders protected content when valid token present', () => {
        localStorage.setItem('access_token', 'valid-token');
        jwtDecode.mockReturnValue({ exp: Date.now() / 1000 + 3600 });

        render(
            <BrowserRouter>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </BrowserRouter>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
}); 