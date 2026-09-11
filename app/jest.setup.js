import '@testing-library/react-native/extend-expect';

// Mock reanimated
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  Gesture: {
    Pan: () => ({
      onBegin: function () { return this; },
      onUpdate: function () { return this; },
      onEnd: function () { return this; },
    }),
  },
  GestureDetector: ({ children }) => children,
  GestureHandlerRootView: ({ children }) => children,
}));

// Mock quick-sqlite
jest.mock('react-native-quick-sqlite', () => ({
  open: jest.fn(() => ({
    execute: jest.fn(() => ({ rows: { _array: [] } })),
    executeSql: jest.fn(),
    close: jest.fn(),
  })),
  QuickSQLite: {
    openDB: jest.fn(),
  },
}));

// Mock fast-image
jest.mock('react-native-fast-image', () => ({
  __esModule: true,
  default: 'FastImage',
}));

// Mock lucide
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const MockIcon = (props) => React.createElement('Icon', props);
  return new Proxy({}, { get: () => MockIcon });
});

// Mock react-native-pdf and blob-util (native)
jest.mock('react-native-pdf', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (props) => React.createElement('PdfMock', props),
  };
});
jest.mock('react-native-blob-util', () => ({}));
jest.mock(
  'react-native-keep-awake',
  () => ({
    activateKeepAwake: jest.fn(),
    deactivateKeepAwake: jest.fn(),
  }),
  { virtual: true },
);
