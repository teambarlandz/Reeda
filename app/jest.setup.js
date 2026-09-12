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
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/tmp',
  exists: jest.fn(() => Promise.resolve(true)),
  mkdir: jest.fn(() => Promise.resolve()),
  copyFile: jest.fn(() => Promise.resolve()),
  readFile: jest.fn(() => Promise.resolve('')),
  stat: jest.fn(() => Promise.resolve({ size: 1024, mtime: new Date() })),
  unlink: jest.fn(() => Promise.resolve()),
}));
jest.mock(
  'react-native-document-picker',
  () => ({
    types: { allFiles: 'allFiles' },
    pick: jest.fn(() => Promise.resolve([])),
    isCancel: jest.fn(() => false),
  }),
  { virtual: true },
);
jest.mock(
  'react-native-receive-sharing-intent',
  () => ({
    getReceivedFiles: jest.fn(() => Promise.resolve([])),
    clearReceivedFiles: jest.fn(),
  }),
  { virtual: true },
);
const mockWordArray = { toString: jest.fn(() => 'mockhash') };
jest.mock('crypto-js', () => ({
  enc: { Base64: { parse: jest.fn(() => mockWordArray) } },
  SHA256: jest.fn(() => ({ toString: jest.fn(() => 'mockhash') })),
  algo: { SHA256: { create: jest.fn(() => ({ update: jest.fn(() => ({})), finalize: jest.fn(() => mockWordArray) })) } },
}));
