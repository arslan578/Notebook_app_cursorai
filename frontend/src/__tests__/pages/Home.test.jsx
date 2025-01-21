import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../pages/Home';
import { notesAPI } from '../../api';

jest.mock('../../api', () => ({
    notesAPI: {
        getAll: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
}));

describe('Home Component', () => {
    beforeEach(() => {
        notesAPI.getAll.mockResolvedValue({ data: [] });
    });

    test('renders create note form', async () => {
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/content/i)).toBeInTheDocument();
    });

    test('creates new note', async () => {
        notesAPI.create.mockResolvedValueOnce({});
        render(
            <BrowserRouter>
                <Home />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/title/i), {
            target: { value: 'New Note' },
        });
        fireEvent.change(screen.getByPlaceholderText(/content/i), {
            target: { value: 'Note content' },
        });
        fireEvent.click(screen.getByText('Create Note'));

        await waitFor(() => {
            expect(notesAPI.create).toHaveBeenCalledWith({
                title: 'New Note',
                content: 'Note content',
            });
        });
    });
}); 