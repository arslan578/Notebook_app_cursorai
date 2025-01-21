import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../../pages/Profile';
import { userAPI } from '../../api';

jest.mock('../../api', () => ({
    userAPI: {
        getProfile: jest.fn(),
        updateProfile: jest.fn(),
        changePassword: jest.fn(),
    },
}));

const mockUserData = {
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
};

describe('Profile Component', () => {
    beforeEach(() => {
        userAPI.getProfile.mockResolvedValue({ data: mockUserData });
        render(
            <BrowserRouter>
                <Profile />
            </BrowserRouter>
        );
    });

    test('renders profile form with user data', async () => {
        await waitFor(() => {
            expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
            expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
        });
    });

    test('handles profile update', async () => {
        userAPI.updateProfile.mockResolvedValueOnce({});

        await waitFor(() => {
            fireEvent.change(screen.getByDisplayValue('test@example.com'), {
                target: { value: 'new@example.com' },
            });
        });

        fireEvent.click(screen.getByText('Update Profile'));

        await waitFor(() => {
            expect(userAPI.updateProfile).toHaveBeenCalled();
            expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
        });
    });

    test('handles password change', async () => {
        userAPI.changePassword.mockResolvedValueOnce({});

        fireEvent.click(screen.getByText('Change Password'));

        const currentPassword = screen.getByPlaceholder(/current password/i);
        const newPassword = screen.getByPlaceholder(/new password/i);
        const confirmPassword = screen.getByPlaceholder(/re-enter/i);

        fireEvent.change(currentPassword, { target: { value: 'oldpass123' } });
        fireEvent.change(newPassword, { target: { value: 'newpass123' } });
        fireEvent.change(confirmPassword, { target: { value: 'newpass123' } });

        fireEvent.click(screen.getByText('Change Password'));

        await waitFor(() => {
            expect(userAPI.changePassword).toHaveBeenCalled();
            expect(screen.getByText('Password changed successfully!')).toBeInTheDocument();
        });
    });

    test('validates password match', async () => {
        fireEvent.click(screen.getByText('Change Password'));

        const newPassword = screen.getByPlaceholder(/new password/i);
        const confirmPassword = screen.getByPlaceholder(/re-enter/i);

        fireEvent.change(newPassword, { target: { value: 'newpass123' } });
        fireEvent.change(confirmPassword, { target: { value: 'different123' } });

        fireEvent.click(screen.getByText('Change Password'));

        await waitFor(() => {
            expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
        });
    });
}); 