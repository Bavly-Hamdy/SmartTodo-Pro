import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalendarEventModal from './CalendarEventModal';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  category: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const mockEvent: CalendarEvent = {
  id: 'event-1',
  title: 'Test Event',
  description: 'Test Description',
  dueDate: new Date('2024-01-15T10:00:00'),
  priority: 'high',
  status: 'pending',
  category: 'work',
  userId: 'user-1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSave: jest.fn(),
  onDelete: jest.fn(),
  event: null,
  selectedDate: new Date('2024-01-20'),
};

describe('CalendarEventModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when open', () => {
    render(<CalendarEventModal {...defaultProps} />);

    expect(screen.getByText('Add Event')).toBeInTheDocument();
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
  });

  it('should not render modal when closed', () => {
    render(<CalendarEventModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Add Event')).not.toBeInTheDocument();
  });

  it('should populate form when editing existing event', () => {
    render(<CalendarEventModal {...defaultProps} event={mockEvent} />);

    expect(screen.getByText('Edit Event')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Event')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('work')).toBeInTheDocument();
  });

  it('should pre-populate date when selected date is provided', () => {
    const selectedDate = new Date('2024-01-25T14:30:00');
    render(<CalendarEventModal {...defaultProps} selectedDate={selectedDate} />);

    const dateInput = screen.getByLabelText('Due Date') as HTMLInputElement;
    expect(dateInput.value).toContain('2024-01-25');
  });

  it('should handle form submission for new event', async () => {
    const mockOnSave = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<CalendarEventModal {...defaultProps} onSave={mockOnSave} />);

    await user.type(screen.getByLabelText('Title *'), 'New Event');
    await user.type(screen.getByLabelText('Description'), 'New Description');
    await user.type(screen.getByLabelText('Category'), 'personal');

    await user.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'New Event',
        description: 'New Description',
        dueDate: expect.any(Date),
        priority: 'medium',
        category: 'personal',
        status: 'pending',
      });
    });
  });

  it('should handle form submission for existing event', async () => {
    const mockOnSave = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<CalendarEventModal {...defaultProps} event={mockEvent} onSave={mockOnSave} />);

    await user.clear(screen.getByLabelText('Title *'));
    await user.type(screen.getByLabelText('Title *'), 'Updated Event');

    await user.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Updated Event',
        description: 'Test Description',
        dueDate: expect.any(Date),
        priority: 'high',
        category: 'work',
        status: 'pending',
      });
    });
  });

  it('should show error when title is empty', async () => {
    const user = userEvent.setup();

    render(<CalendarEventModal {...defaultProps} />);

    await user.click(screen.getByText('Create'));

    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  it('should handle priority selection', async () => {
    const user = userEvent.setup();

    render(<CalendarEventModal {...defaultProps} />);

    await user.type(screen.getByLabelText('Title *'), 'Test Event');
    await user.click(screen.getByText('High'));

    await user.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'high',
        })
      );
    });
  });

  it('should handle status selection when editing', async () => {
    const user = userEvent.setup();

    render(<CalendarEventModal {...defaultProps} event={mockEvent} />);

    await user.click(screen.getByText('Completed'));

    await user.click(screen.getByText('Update'));

    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
        })
      );
    });
  });

  it('should handle delete event', async () => {
    const mockOnDelete = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    // Mock window.confirm
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<CalendarEventModal {...defaultProps} event={mockEvent} onDelete={mockOnDelete} />);

    await user.click(screen.getByText('Delete'));

    expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this event?');
    expect(mockOnDelete).toHaveBeenCalledWith('event-1');
  });

  it('should not delete when user cancels confirmation', async () => {
    const mockOnDelete = jest.fn();
    const user = userEvent.setup();

    // Mock window.confirm
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(false);

    render(<CalendarEventModal {...defaultProps} event={mockEvent} onDelete={mockOnDelete} />);

    await user.click(screen.getByText('Delete'));

    expect(mockConfirm).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('should handle save errors', async () => {
    const mockOnSave = jest.fn().mockRejectedValue(new Error('Save failed'));
    const user = userEvent.setup();

    render(<CalendarEventModal {...defaultProps} onSave={mockOnSave} />);

    await user.type(screen.getByLabelText('Title *'), 'Test Event');
    await user.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });
  });

  it('should handle delete errors', async () => {
    const mockOnDelete = jest.fn().mockRejectedValue(new Error('Delete failed'));
    const user = userEvent.setup();

    // Mock window.confirm
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<CalendarEventModal {...defaultProps} event={mockEvent} onDelete={mockOnDelete} />);

    await user.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByText('Delete failed')).toBeInTheDocument();
    });
  });

  it('should close modal when cancel is clicked', async () => {
    const user = userEvent.setup();

    render(<CalendarEventModal {...defaultProps} />);

    await user.click(screen.getByText('Cancel'));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should close modal when backdrop is clicked', async () => {
    render(<CalendarEventModal {...defaultProps} />);

    const backdrop = screen.getByTestId('backdrop');
    fireEvent.click(backdrop);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should show loading state during save', async () => {
    const mockOnSave = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    const user = userEvent.setup();

    render(<CalendarEventModal {...defaultProps} onSave={mockOnSave} />);

    await user.type(screen.getByLabelText('Title *'), 'Test Event');
    await user.click(screen.getByText('Create'));

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should show loading state during delete', async () => {
    const mockOnDelete = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    const user = userEvent.setup();

    // Mock window.confirm
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<CalendarEventModal {...defaultProps} event={mockEvent} onDelete={mockOnDelete} />);

    await user.click(screen.getByText('Delete'));

    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<CalendarEventModal {...defaultProps} />);

    // Check for proper ARIA labels
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();

    // Check for proper button roles
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();

    render(<CalendarEventModal {...defaultProps} />);

    // Tab through form elements
    await user.tab();
    expect(screen.getByLabelText('Title *')).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText('Description')).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText('Due Date')).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText('Category')).toHaveFocus();
  });
}); 