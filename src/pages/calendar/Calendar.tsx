import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDaysIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useCalendar, CalendarEvent } from '../../hooks/useCalendar';
import CalendarGrid from '../../components/calendar/CalendarGrid';
import CalendarEventModal from '../../components/calendar/CalendarEventModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Calendar: React.FC = () => {
  const {
    events,
    loading,
    error,
    view,
    addEvent,
    updateEvent,
    deleteEvent,
    updateEventDate,
    navigateView,
    changeView,
    goToToday,
  } = useCalendar();

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setShowEventModal(true);
  };

  const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (selectedEvent) {
      // Update existing event
      await updateEvent(selectedEvent.id, eventData);
    } else {
      // Create new event
      await addEvent(eventData);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (selectedEvent) {
      await deleteEvent(eventId);
    }
  };

  const handleEventDrop = async (eventId: string, newDate: Date) => {
    await updateEventDate(eventId, newDate);
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                View and manage your tasks in calendar format
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowEventModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Event
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Calendar Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateView('prev')}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {format(view.currentDate, 'MMMM yyyy')}
                </h2>
                
                <button
                  onClick={() => navigateView('next')}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => changeView('month')}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    view.type === 'month'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => changeView('week')}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    view.type === 'week'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => changeView('day')}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    view.type === 'day'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Day
                </button>
                
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  Today
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <CalendarGrid
            currentDate={view.currentDate}
            view={view.type}
            events={events}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onEventDrop={handleEventDrop}
          />
        </div>

        {/* Event Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarDaysIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Events</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{events.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {events.filter(e => e.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {events.filter(e => e.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-red-600 rounded-full"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">High Priority</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {events.filter(e => e.priority === 'high').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <CalendarEventModal
        isOpen={showEventModal}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        event={selectedEvent}
        selectedDate={selectedDate || undefined}
      />
    </div>
  );
};

export default Calendar; 