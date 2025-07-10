import React from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarEvent } from '../../hooks/useCalendar';

interface CalendarGridProps {
  currentDate: Date;
  view: 'month' | 'week' | 'day';
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventDrop?: (eventId: string, newDate: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  view,
  events,
  onDateClick,
  onEventClick,
  onEventDrop
}) => {
  const getDaysInView = () => {
    switch (view) {
      case 'month':
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        return eachDayOfInterval({ start: weekStart, end: weekEnd });
      case 'day':
        return [currentDate];
      default:
        return [];
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.dueDate);
      return isSameDay(eventDate, date);
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const days = getDaysInView();

  if (view === 'day') {
    const dayEvents = getEventsForDate(currentDate);
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          
          {dayEvents.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No events scheduled for this date.</p>
          ) : (
            <div className="space-y-3">
              {dayEvents.map(event => (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => onEventClick(event)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(event.priority)}`} />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{event.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{event.category}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 p-4 border-b border-gray-200 dark:border-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className={`
                  min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer
                  ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}
                  ${isCurrentDay ? 'ring-2 ring-indigo-500' : ''}
                  hover:bg-gray-50 dark:hover:bg-gray-700
                `}
                onClick={() => onDateClick(day)}
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <motion.div
                      key={event.id}
                      whileHover={{ scale: 1.05 }}
                      className="text-xs p-1 rounded truncate cursor-pointer"
                      style={{
                        backgroundColor: event.status === 'completed' ? '#dcfce7' : '#f3f4f6',
                        color: event.status === 'completed' ? '#166534' : '#374151'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`} />
                        <span className="truncate">{event.title}</span>
                      </div>
                    </motion.div>
                  ))}
                  
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid; 