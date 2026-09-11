import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LibraryScreen } from '../../features/library/screens/LibraryScreen';
import { SearchScreen } from '../../features/library/screens/SearchScreen';
import { BookDetailsScreen } from '../../features/details/BookDetailsScreen';
import { ReaderScreen } from '../../features/reader/screens/ReaderScreen';

export type RootStackParamList = {
  Library: undefined;
  BookDetails: { bookId: string };
  Reader: { bookId: string };
  Search: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Library" component={LibraryScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="BookDetails" component={BookDetailsScreen} />
        <Stack.Screen name="Reader" component={ReaderScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
