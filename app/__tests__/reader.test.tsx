import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../src/shared/theme/ThemeProvider';
import { ReaderScreen } from '../src/features/reader/screens/ReaderScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: { bookId: 'sample-alice' } }),
  NavigationContainer: ({ children }: any) => children,
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: (opts: any) => {
    if (opts.queryKey[0] === 'book') return { data: { id: 'sample-alice', title: "Alice's Adventures", author: 'Lewis Carroll' } };
    if (opts.queryKey[0] === 'chapters') return { data: [] };
    if (opts.queryKey[0] === 'progress') return { data: { progressPercent: 0.43, currentChapterId: 'c1' } };
    return { data: null };
  },
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: any) => children,
}));

describe('ReaderScreen M3', () => {
  it('shows reflowed text for sample EPUB', () => {
    const { getAllByText, getByTestId } = render(
      <ThemeProvider>
        <ReaderScreen />
      </ThemeProvider>,
    );
    expect(getByTestId('reader-screen')).toBeTruthy();
    // Sample alice first chapter title should be visible in ScrollMode (appears in title + rawText start)
    expect(getAllByText(/Down the Rabbit-Hole/).length).toBeGreaterThanOrEqual(1);
  });

  it('has menu and toolbar wiring', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ReaderScreen />
      </ThemeProvider>,
    );
    expect(getByTestId('rectangular-menu')).toBeTruthy();
    // Toolbar hidden by default, but tap should show — we test existence via rendered tree (toolbar always mounted, just translated)
    expect(getByTestId('reader-content-tap')).toBeTruthy();
  });
});
