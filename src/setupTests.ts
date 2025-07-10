// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Polyfill for TextEncoder/TextDecoder in Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Polyfill for ReadableStream in Node.js environment
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = require('stream').Readable;
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return []; }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock Framer Motion with proper scoping
jest.mock('framer-motion', () => {
  const React = require('react');
  
  return {
    motion: {
      div: React.forwardRef((props: any, ref: any) => React.createElement('div', { ...props, ref })),
      span: React.forwardRef((props: any, ref: any) => React.createElement('span', { ...props, ref })),
      button: React.forwardRef((props: any, ref: any) => React.createElement('button', { ...props, ref })),
      svg: React.forwardRef((props: any, ref: any) => React.createElement('svg', { ...props, ref })),
      path: React.forwardRef((props: any, ref: any) => React.createElement('path', { ...props, ref })),
      circle: React.forwardRef((props: any, ref: any) => React.createElement('circle', { ...props, ref })),
      rect: React.forwardRef((props: any, ref: any) => React.createElement('rect', { ...props, ref })),
      g: React.forwardRef((props: any, ref: any) => React.createElement('g', { ...props, ref })),
      text: React.forwardRef((props: any, ref: any) => React.createElement('text', { ...props, ref })),
      tspan: React.forwardRef((props: any, ref: any) => React.createElement('tspan', { ...props, ref })),
      line: React.forwardRef((props: any, ref: any) => React.createElement('line', { ...props, ref })),
      polyline: React.forwardRef((props: any, ref: any) => React.createElement('polyline', { ...props, ref })),
      polygon: React.forwardRef((props: any, ref: any) => React.createElement('polygon', { ...props, ref })),
      ellipse: React.forwardRef((props: any, ref: any) => React.createElement('ellipse', { ...props, ref })),
      foreignObject: React.forwardRef((props: any, ref: any) => React.createElement('foreignObject', { ...props, ref })),
      image: React.forwardRef((props: any, ref: any) => React.createElement('image', { ...props, ref })),
      useTransform: () => (value: any) => value,
      useMotionValue: (initial: any) => ({ get: () => initial, set: () => {} }),
      useSpring: (value: any) => value,
      useInView: () => ({ ref: () => {}, inView: true }),
      AnimatePresence: ({ children }: any) => children,
      LazyMotion: ({ children }: any) => children,
      domAnimation: {},
      domMax: {},
    },
    AnimatePresence: ({ children }: any) => children,
    LazyMotion: ({ children }: any) => children,
    domAnimation: {},
    domMax: {},
  };
});

// Mock react-router-dom
jest.mock('react-router-dom', () => {
  const React = require('react');
  return {
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
    useParams: () => ({}),
    Link: ({ children, to, ...props }: any) => React.createElement('a', { href: to, ...props }, children),
    NavLink: ({ children, to, ...props }: any) => React.createElement('a', { href: to, ...props }, children),
    Outlet: () => React.createElement('div', { 'data-testid': 'outlet' }),
  };
});

// Mock react-hot-toast
jest.mock('react-hot-toast', () => {
  const React = require('react');
  return {
    toast: {
      success: jest.fn(),
      error: jest.fn(),
      loading: jest.fn(),
      dismiss: jest.fn(),
    },
    Toaster: () => React.createElement('div', { 'data-testid': 'toaster' }),
  };
});

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, format) => {
    if (format === 'MMM dd') return 'Jan 01';
    if (format === 'MMM dd, yyyy') return 'Jan 01, 2024';
    if (format === 'HH:mm') return '12:00';
    if (format === 'yyyy-MM-dd') return '2024-01-01';
    return date.toString();
  }),
  parseISO: jest.fn((date) => new Date(date)),
  isToday: jest.fn(() => false),
  isYesterday: jest.fn(() => false),
  isTomorrow: jest.fn(() => false),
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  subDays: jest.fn((date, days) => new Date(date.getTime() - days * 24 * 60 * 60 * 1000)),
  startOfWeek: jest.fn((date) => date),
  endOfWeek: jest.fn((date) => date),
  eachDayOfInterval: jest.fn(() => [new Date()]),
  differenceInDays: jest.fn(() => 0),
  differenceInHours: jest.fn(() => 0),
  differenceInMinutes: jest.fn(() => 0),
}));

// Mock recharts
jest.mock('recharts', () => {
  const React = require('react');
  return {
    BarChart: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'bar-chart', ...props }, children),
    Bar: ({ ...props }: any) => React.createElement('div', { 'data-testid': 'bar', ...props }),
    LineChart: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'line-chart', ...props }, children),
    Line: ({ ...props }: any) => React.createElement('div', { 'data-testid': 'line', ...props }),
    PieChart: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'pie-chart', ...props }, children),
    Pie: ({ ...props }: any) => React.createElement('div', { 'data-testid': 'pie', ...props }),
    Cell: ({ ...props }: any) => React.createElement('div', { 'data-testid': 'cell', ...props }),
    XAxis: ({ ...props }: any) => React.createElement('div', { 'data-testid': 'x-axis', ...props }),
    YAxis: ({ ...props }: any) => React.createElement('div', { 'data-testid': 'y-axis', ...props }),
    CartesianGrid: ({ ...props }: any) => React.createElement('div', { 'data-testid': 'cartesian-grid', ...props }),
    Tooltip: ({ ...props }: any) => React.createElement('div', { 'data-testid': 'tooltip', ...props }),
    ResponsiveContainer: ({ children, ...props }: any) => React.createElement('div', { 'data-testid': 'responsive-container', ...props }, children),
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
} as any;
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
} as any;
global.sessionStorage = sessionStorageMock;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: jest.fn(() => ({
    getPropertyValue: jest.fn(() => ''),
    display: 'block',
    pointerEvents: 'auto',
    // Add any other properties needed for tests
  })),
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn();

// Mock performance
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
  },
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Mock fetch
global.fetch = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Mock URL.revokeObjectURL
global.URL.revokeObjectURL = jest.fn(); 