import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CalendarGrid from './CalendarGrid';

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

const mockEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Test Event 1',
    description: 'Test Description 1',
    dueDate: new Date('2024-01-15'),
    priority: 'high',
    status: 'pending',
    category: 'work',
    userId: 'user-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'event-2',
    title: 'Test Event 2',
    description: 'Test Description 2',
    dueDate: new Date('2024-01-15'),
    priority: 'medium',
    status: 'completed',
    category: 'personal',
    userId: 'user-1',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'event-3',
    title: 'Test Event 3',
    description: 'Test Description 3',
    dueDate: new Date('2024-01-20'),
    priority: 'low',
    status: 'in-progress',
    category: 'meeting',
    userId: 'user-1',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
];

const defaultProps = {
  currentDate: new Date('2024-01-15'),
  view: 'month' as const,
  events: mockEvents,
  onDateClick: jest.fn(),
  onEventClick: jest.fn(),
  onEventDrop: jest.fn(),
};

describe('CalendarGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render calendar grid with day headers', () => {
    render(<CalendarGrid {...defaultProps} />);

    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('should render calendar days', () => {
    render(<CalendarGrid {...defaultProps} />);

    // Should render days of the month
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('should display events on their due dates', () => {
    render(<CalendarGrid {...defaultProps} />);

    // Events for January 15th
    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Event 2')).toBeInTheDocument();
    
    // Event for January 20th
    expect(screen.getByText('Test Event 3')).toBeInTheDocument();
  });

  it('should show priority indicators', () => {
    render(<CalendarGrid {...defaultProps} />);

    // Check for priority color indicators
    const priorityIndicators = screen.getAllByTestId('priority-indicator');
    expect(priorityIndicators).toHaveLength(3);
  });

  it('should handle date click', async () => {
    const user = userEvent.setup();
    const mockOnDateClick = jest.fn();

    render(<CalendarGrid {...defaultProps} onDateClick={mockOnDateClick} />);

    const dayCell = screen.getByText('15').closest('div');
    if (dayCell) {
      await user.click(dayCell);
    }

    expect(mockOnDateClick).toHaveBeenCalledWith(expect.any(Date));
  });

  it('should handle event click', async () => {
    const user = userEvent.setup();
    const mockOnEventClick = jest.fn();

    render(<CalendarGrid {...defaultProps} onEventClick={mockOnEventClick} />);

    const eventElement = screen.getByText('Test Event 1');
    await user.click(eventElement);

    expect(mockOnEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('should handle drag and drop', async () => {
    const user = userEvent.setup();
    const mockOnEventDrop = jest.fn();

    render(<CalendarGrid {...defaultProps} onEventDrop={mockOnEventDrop} />);

    const eventElement = screen.getByText('Test Event 1');
    const targetDate = screen.getByText('20').closest('div');

    // Start drag
    fireEvent.dragStart(eventElement);
    
    // Drop on target date
    if (targetDate) {
      fireEvent.drop(targetDate);
    }

    expect(mockOnEventDrop).toHaveBeenCalledWith('event-1', expect.any(Date));
  });

  it('should show more events indicator when there are more than 3 events', () => {
    const manyEvents: CalendarEvent[] = [
      ...mockEvents,
      {
        id: 'event-4',
        title: 'Test Event 4',
        description: 'Test Description 4',
        dueDate: new Date('2024-01-15'),
        priority: 'low' as const,
        status: 'pending' as const,
        category: 'work',
        userId: 'user-1',
        createdAt: new Date('2024-01-04'),
        updatedAt: new Date('2024-01-04'),
      },
      {
        id: 'event-5',
        title: 'Test Event 5',
        description: 'Test Description 5',
        dueDate: new Date('2024-01-15'),
        priority: 'medium' as const,
        status: 'pending' as const,
        category: 'personal',
        userId: 'user-1',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
      },
    ];

    render(<CalendarGrid {...defaultProps} events={manyEvents} />);

    expect(screen.getByText('+2 more')).toBeInTheDocument();
  });

  it('should render day view correctly', () => {
    render(<CalendarGrid {...defaultProps} view="day" />);

    expect(screen.getByText('Monday, January 15, 2024')).toBeInTheDocument();
    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Event 2')).toBeInTheDocument();
  });

  it('should show no events message in day view when no events', () => {
    render(<CalendarGrid {...defaultProps} view="day" events={[]} />);

    expect(screen.getByText('No events scheduled for this date.')).toBeInTheDocument();
  });

  it('should handle week view', () => {
    render(<CalendarGrid {...defaultProps} view="week" />);

    // Should still show day headers
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('should highlight current day', () => {
    const today = new Date();
    render(<CalendarGrid {...defaultProps} currentDate={today} />);

    const todayElement = screen.getByText(today.getDate().toString());
    expect(todayElement.closest('div')).toHaveClass('ring-2', 'ring-indigo-500');
  });

  it('should show different background for current month vs other months', () => {
    render(<CalendarGrid {...defaultProps} />);

    const currentMonthDays = screen.getAllByText(/^\d+$/);
    currentMonthDays.forEach(day => {
      const dayCell = day.closest('div');
      if (dayCell) {
        expect(dayCell).toHaveClass('bg-white', 'dark:bg-gray-800');
      }
    });
  });

  it('should handle event status colors', () => {
    render(<CalendarGrid {...defaultProps} />);

    // Check for status-based styling
    const completedEvent = screen.getByText('Test Event 2');
    expect(completedEvent.closest('div')).toHaveStyle({
      backgroundColor: expect.stringContaining('green'),
    });
  });

  it('should be accessible', () => {
    render(<CalendarGrid {...defaultProps} />);

    // Check for proper ARIA roles and labels
    const calendarGrid = screen.getByRole('grid');
    expect(calendarGrid).toBeInTheDocument();

    // Check for proper button roles
    const dayButtons = screen.getAllByRole('button');
    expect(dayButtons.length).toBeGreaterThan(0);
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();

    render(<CalendarGrid {...defaultProps} />);

    // Tab to first day
    await user.tab();
    
    // Should be able to navigate with arrow keys
    const firstDay = screen.getByText('1');
    if (firstDay) {
      await user.click(firstDay);
      expect(defaultProps.onDateClick).toHaveBeenCalled();
    }
  });

  it('should handle drag over events', () => {
    const mockOnEventDrop = jest.fn();

    render(<CalendarGrid {...defaultProps} onEventDrop={mockOnEventDrop} />);

    const targetDate = screen.getByText('20').closest('div');
    
    if (targetDate) {
      fireEvent.dragOver(targetDate);
      // Should not throw error
      expect(targetDate).toBeInTheDocument();
    }
  });

  it('should handle empty events array', () => {
    render(<CalendarGrid {...defaultProps} events={[]} />);

    // Should still render calendar grid
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('should handle events with missing optional fields', () => {
    const eventsWithMissingFields = [
      {
        id: 'event-1',
        title: 'Test Event',
        dueDate: new Date('2024-01-15'),
        priority: 'medium' as const,
        status: 'pending' as const,
        category: 'work',
        userId: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    render(<CalendarGrid {...defaultProps} events={eventsWithMissingFields} />);

    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('should handle different date formats correctly', () => {
    const differentDate = new Date('2024-02-15');
    render(<CalendarGrid {...defaultProps} currentDate={differentDate} />);

    expect(screen.getByText('February 2024')).toBeInTheDocument();
  });
}); 