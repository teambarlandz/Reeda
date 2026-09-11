import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../src/shared/theme/ThemeProvider';
import { LibraryScreen } from '../src/features/library/screens/LibraryScreen';

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    useRoute: () => ({ params: {} }),
    NavigationContainer: ({ children }: any) => children,
  };
});
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children,
    Screen: () => null,
  }),
}));
jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: [] }),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: any) => children,
}));

describe('LibraryScreen', () => {
  it('shows empty state when no books', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <LibraryScreen />
      </ThemeProvider>,
    );
    expect(getByText('Your shelf is empty')).toBeTruthy();
    expect(getByTestId('import-cta')).toBeTruthy();
  });

  it('has My Library title and top nav', () => {
    const { getByText } = render(
      <ThemeProvider>
        <LibraryScreen />
      </ThemeProvider>,
    );
    expect(getByText('My Library')).toBeTruthy();
  });
});
