import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useTaskSearch } from '../../hooks/useTasks';

// Mock the hooks
jest.mock('../../hooks/useTasks');
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

const mockUseTaskSearch = useTaskSearch as jest.MockedFunction<typeof useTaskSearch>;

describe('SearchBar', () => {
  const mockOnTaskSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input', () => {
    mockUseTaskSearch.mockReturnValue({
      searchResults: [],
      isSearching: false,
    });

    render(
      <BrowserRouter>
        <SearchBar onTaskSelect={mockOnTaskSelect} />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Search tasks by title or tags...')).toBeInTheDocument();
  });

  it('shows loading spinner when searching', () => {
    mockUseTaskSearch.mockReturnValue({
      searchResults: [],
      isSearching: true,
    });

    render(
      <BrowserRouter>
        <SearchBar onTaskSelect={mockOnTaskSelect} />
      </BrowserRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays search results when available', () => {
    const mockSearchResults = [
      {
        id: '1',
        title: 'Test Task',
        description: 'Test description',
        status: 'pending' as const,
        priority: 'medium' as const,
        category: 'Work',
        dueDate: new Date('2024-01-01'),
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockUseTaskSearch.mockReturnValue({
      searchResults: mockSearchResults,
      isSearching: false,
    });

    render(
      <BrowserRouter>
        <SearchBar onTaskSelect={mockOnTaskSelect} />
      </BrowserRouter>
    );

    // Focus the input to show results
    const searchInput = screen.getByPlaceholderText('Search tasks by title or tags...');
    fireEvent.focus(searchInput);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('calls onTaskSelect when a task is clicked', () => {
    const mockSearchResults = [
      {
        id: '1',
        title: 'Test Task',
        status: 'pending' as const,
        priority: 'medium' as const,
        category: 'Work',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockUseTaskSearch.mockReturnValue({
      searchResults: mockSearchResults,
      isSearching: false,
    });

    render(
      <BrowserRouter>
        <SearchBar onTaskSelect={mockOnTaskSelect} />
      </BrowserRouter>
    );

    // Focus the input to show results
    const searchInput = screen.getByPlaceholderText('Search tasks by title or tags...');
    fireEvent.focus(searchInput);

    // Click on the task
    const taskElement = screen.getByText('Test Task');
    fireEvent.click(taskElement);

    expect(mockOnTaskSelect).toHaveBeenCalledWith(mockSearchResults[0]);
  });

  it('shows "no results" message when search has no results', () => {
    mockUseTaskSearch.mockReturnValue({
      searchResults: [],
      isSearching: false,
    });

    render(
      <BrowserRouter>
        <SearchBar onTaskSelect={mockOnTaskSelect} />
      </BrowserRouter>
    );

    // Focus the input and type something
    const searchInput = screen.getByPlaceholderText('Search tasks by title or tags...');
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText(/No tasks found matching/)).toBeInTheDocument();
  });

  it('debounces search input', async () => {
    mockUseTaskSearch.mockReturnValue({
      searchResults: [],
      isSearching: false,
    });

    render(
      <BrowserRouter>
        <SearchBar onTaskSelect={mockOnTaskSelect} />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search tasks by title or tags...');
    
    // Type rapidly
    fireEvent.change(searchInput, { target: { value: 't' } });
    fireEvent.change(searchInput, { target: { value: 'te' } });
    fireEvent.change(searchInput, { target: { value: 'tes' } });
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for debounce
    await waitFor(() => {
      expect(mockUseTaskSearch).toHaveBeenCalledWith('test');
    }, { timeout: 1000 });
  });

  it('handles task with no due date', () => {
    const mockSearchResults = [
      {
        id: '1',
        title: 'Test Task',
        status: 'pending' as const,
        priority: 'medium' as const,
        category: 'Work',
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockUseTaskSearch.mockReturnValue({
      searchResults: mockSearchResults,
      isSearching: false,
    });

    render(
      <BrowserRouter>
        <SearchBar onTaskSelect={mockOnTaskSelect} />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search tasks by title or tags...');
    fireEvent.focus(searchInput);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    // Should not show due date text
    expect(screen.queryByText(/Due/)).not.toBeInTheDocument();
  });

  it('handles task with due date', () => {
    const mockSearchResults = [
      {
        id: '1',
        title: 'Test Task',
        status: 'pending' as const,
        priority: 'medium' as const,
        category: 'Work',
        dueDate: new Date('2024-01-01'),
        userId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockUseTaskSearch.mockReturnValue({
      searchResults: mockSearchResults,
      isSearching: false,
    });

    render(
      <BrowserRouter>
        <SearchBar onTaskSelect={mockOnTaskSelect} />
      </BrowserRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search tasks by title or tags...');
    fireEvent.focus(searchInput);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText(/Due/)).toBeInTheDocument();
  });
}); 