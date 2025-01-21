import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../components/Header';
import { authAPI } from '../../api';

jest.mock('../../api', () => ({
    authAPI: {
        logout: jest.fn(),
    },
}));

describe('Header Component', () => {
    beforeEach(() => {
        render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );
    });

    test('renders header with title', () => {
        expect(screen.getByText('Notes App')).toBeInTheDocument();
    });

    test('renders navigation links', () => {
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    test('handles logout', async () => {
        authAPI.logout.mockResolvedValueOnce({});
        
        fireEvent.click(screen.getByText('Logout'));
        
        expect(authAPI.logout).toHaveBeenCalled();
    });
}); 