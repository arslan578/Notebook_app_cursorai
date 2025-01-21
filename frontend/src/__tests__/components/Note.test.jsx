import { render, screen, fireEvent } from '@testing-library/react';
import Note from '../../components/Note';

describe('Note Component', () => {
    const mockNote = {
        id: 1,
        title: 'Test Note',
        content: 'Test Content'
    };

    test('renders note with title and content', () => {
        render(<Note note={mockNote} onDelete={() => {}} />);
        
        expect(screen.getByText('Test Note')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('calls onDelete when delete button is clicked', () => {
        const mockDelete = jest.fn();
        render(<Note note={mockNote} onDelete={mockDelete} />);
        
        fireEvent.click(screen.getByText('Delete'));
        expect(mockDelete).toHaveBeenCalled();
    });
}); 