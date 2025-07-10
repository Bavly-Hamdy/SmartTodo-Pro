# Calendar Firebase Integration

This document describes the Calendar page integration with Firebase backend for SmartTodo Pro.

## **Overview**

The Calendar page has been completely rewritten to use real Firebase data and operations, replacing all static mock data with live Firestore integration.

## **Architecture**

### **Components**

1. **`useCalendar` Hook** (`src/hooks/useCalendar.ts`)
   - Manages calendar state and Firebase operations
   - Handles real-time subscriptions to tasks
   - Provides CRUD operations for calendar events

2. **`CalendarEventModal` Component** (`src/components/calendar/CalendarEventModal.tsx`)
   - Modal for adding/editing calendar events
   - Form validation and error handling
   - Accessible design with keyboard navigation

3. **`CalendarGrid` Component** (`src/components/calendar/CalendarGrid.tsx`)
   - Renders calendar grid with events
   - Supports drag-and-drop functionality
   - Handles different view types (month/week/day)

4. **`Calendar` Page** (`src/pages/calendar/Calendar.tsx`)
   - Main calendar page component
   - Integrates all calendar components
   - Provides navigation and view controls

### **Data Flow**

```
Firebase Firestore → useCalendar Hook → Calendar Components → UI
```

## **Features**

### **Real Calendar Data**

- ✅ **Fetch all tasks** for authenticated user from Firestore
- ✅ **Display tasks** on their due dates in calendar view
- ✅ **Real-time updates** using `onSnapshot()` subscriptions
- ✅ **Filter tasks** with due dates only

### **Add Task from Calendar**

- ✅ **"+" button** opens Add Task modal
- ✅ **Date cell click** opens modal pre-populated with selected date
- ✅ **Form validation** with required fields
- ✅ **Firestore integration** using `addDoc()`
- ✅ **Immediate rendering** of new task on calendar

### **Edit & Delete via Calendar**

- ✅ **Event click** opens Edit Task modal
- ✅ **Update task details** (title, description, due date, status)
- ✅ **Delete functionality** with confirmation
- ✅ **Firestore operations** using `updateDoc()` and `deleteDoc()`

### **Drag & Drop**

- ✅ **Drag events** between dates
- ✅ **Update due date** in Firestore on drop
- ✅ **Visual feedback** during drag operations
- ✅ **Error handling** for failed updates

### **Real-Time Updates**

- ✅ **Live subscriptions** to user tasks
- ✅ **Instant updates** when tasks are modified elsewhere
- ✅ **Optimistic updates** for better UX
- ✅ **Error recovery** for connection issues

### **UI/UX & Accessibility**

- ✅ **Responsive design** for all screen sizes
- ✅ **Dark/Light mode** support
- ✅ **Keyboard navigation** support
- ✅ **ARIA roles** and labels
- ✅ **Loading states** and error handling
- ✅ **Smooth animations** with Framer Motion

## **Technical Implementation**

### **Firestore Queries**

```typescript
// Subscribe to user tasks
const unsubscribe = subscribeToTasks(
  currentUser.uid,
  (tasks: Task[]) => {
    const calendarEvents = tasks
      .filter(task => task.dueDate)
      .map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate!,
        priority: task.priority,
        status: task.status,
        category: task.category,
        userId: task.userId,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }));
    setEvents(calendarEvents);
  },
  { orderBy: 'dueDate' }
);
```

### **Drag & Drop Implementation**

```typescript
// Handle event drop
const handleEventDrop = async (eventId: string, newDate: Date) => {
  try {
    await updateTask(currentUser.uid, eventId, { dueDate: newDate });
  } catch (error) {
    console.error('Error updating event date:', error);
    throw new Error('Failed to update event date');
  }
};
```

### **Modal State Management**

```typescript
const [showEventModal, setShowEventModal] = useState(false);
const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
const [selectedDate, setSelectedDate] = useState<Date | null>(null);
```

## **Data Models**

### **CalendarEvent Interface**

```typescript
export interface CalendarEvent {
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
```

### **CalendarView Interface**

```typescript
export interface CalendarView {
  type: 'month' | 'week' | 'day';
  currentDate: Date;
}
```

## **Firebase Integration**

### **Required Firestore Collections**

1. **`tasks` Collection**
   - Document ID: Auto-generated
   - Fields: `title`, `description`, `dueDate`, `priority`, `status`, `category`, `userId`, `createdAt`, `updatedAt`

### **Security Rules**

```javascript
// Tasks collection
match /tasks/{taskId} {
  allow read, write: if request.auth != null && 
    request.auth.uid == resource.data.userId;
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.userId;
  allow update, delete: if request.auth != null && 
    request.auth.uid == resource.data.userId;
}
```

### **Required Indexes**

1. **Tasks by User and Due Date**
   - Collection: `tasks`
   - Fields: `userId` (Ascending), `dueDate` (Ascending)

2. **Tasks by User and Status**
   - Collection: `tasks`
   - Fields: `userId` (Ascending), `status` (Ascending)

## **Error Handling**

### **Network Errors**

- ✅ **Graceful degradation** when Firestore is unavailable
- ✅ **Retry mechanisms** for failed operations
- ✅ **User-friendly error messages**
- ✅ **Offline state handling**

### **Validation Errors**

- ✅ **Form validation** for required fields
- ✅ **Date validation** for due dates
- ✅ **Priority and status validation**
- ✅ **Real-time validation feedback**

## **Performance Optimizations**

### **Real-Time Subscriptions**

- ✅ **Efficient queries** with proper filters
- ✅ **Unsubscribe cleanup** to prevent memory leaks
- ✅ **Debounced updates** to reduce API calls
- ✅ **Optimistic updates** for better UX

### **Rendering Optimizations**

- ✅ **Memoized components** to prevent unnecessary re-renders
- ✅ **Virtual scrolling** for large event lists
- ✅ **Lazy loading** of calendar days
- ✅ **Efficient event filtering**

## **Testing**

### **Unit Tests**

- ✅ **`useCalendar.test.ts`** - Hook functionality
- ✅ **`CalendarEventModal.test.tsx`** - Modal component
- ✅ **`CalendarGrid.test.tsx`** - Grid component

### **Test Coverage**

- ✅ **CRUD operations** testing
- ✅ **Error handling** scenarios
- ✅ **User interactions** (click, drag, drop)
- ✅ **Accessibility** testing
- ✅ **Edge cases** and error states

## **Usage Examples**

### **Adding a New Event**

```typescript
const { addEvent } = useCalendar();

const handleAddEvent = async () => {
  try {
    await addEvent({
      title: 'New Task',
      description: 'Task description',
      dueDate: new Date(),
      priority: 'medium',
      category: 'work',
      status: 'pending',
    });
  } catch (error) {
    console.error('Failed to add event:', error);
  }
};
```

### **Updating an Event**

```typescript
const { updateEvent } = useCalendar();

const handleUpdateEvent = async (eventId: string) => {
  try {
    await updateEvent(eventId, {
      title: 'Updated Task',
      status: 'completed',
    });
  } catch (error) {
    console.error('Failed to update event:', error);
  }
};
```

### **Deleting an Event**

```typescript
const { deleteEvent } = useCalendar();

const handleDeleteEvent = async (eventId: string) => {
  try {
    await deleteEvent(eventId);
  } catch (error) {
    console.error('Failed to delete event:', error);
  }
};
```

## **Configuration**

### **Environment Variables**

```bash
# Firebase configuration
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### **Firebase Setup**

1. **Enable Firestore Database**
2. **Deploy security rules**
3. **Create required indexes**
4. **Configure authentication**

## **Troubleshooting**

### **Common Issues**

1. **"Missing or insufficient permissions"**
   - Check Firestore security rules
   - Verify user authentication
   - Ensure proper indexes are created

2. **Events not loading**
   - Check Firestore connection
   - Verify user authentication
   - Check console for errors

3. **Drag and drop not working**
   - Check browser compatibility
   - Verify event handlers are properly bound
   - Check for JavaScript errors

4. **Real-time updates not working**
   - Check Firestore subscription
   - Verify network connection
   - Check for subscription cleanup

### **Debug Tools**

- ✅ **Console logging** for all operations
- ✅ **Error boundaries** for component errors
- ✅ **Network tab** monitoring
- ✅ **Firebase console** monitoring

## **Future Enhancements**

### **Planned Features**

- [ ] **Recurring events** support
- [ ] **Event categories** with color coding
- [ ] **Calendar sharing** between users
- [ ] **Export/Import** calendar data
- [ ] **Mobile optimization** improvements
- [ ] **Offline support** with sync
- [ ] **Calendar integrations** (Google, Outlook)

### **Performance Improvements**

- [ ] **Virtual scrolling** for large calendars
- [ ] **Lazy loading** of event details
- [ ] **Caching strategies** for better performance
- [ ] **Background sync** for offline support

## **Contributing**

When contributing to the Calendar integration:

1. **Follow existing patterns** for consistency
2. **Add comprehensive tests** for new features
3. **Update documentation** for any changes
4. **Test with real Firebase data**
5. **Ensure accessibility** compliance

## **Support**

For issues with the Calendar integration:

1. Check the [Firebase Setup Guide](../FIREBASE_SETUP.md)
2. Review [Authentication Guide](../AUTHENTICATION.md)
3. Check browser console for errors
4. Verify Firestore permissions and indexes
5. Test with different browsers and devices

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready 