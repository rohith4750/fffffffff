import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { PinAuthScreen } from './src/screens/PinAuthScreen';
import { DailyRouteScreen } from './src/screens/DailyRouteScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="PinAuthScreen"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="PinAuthScreen" component={PinAuthScreen} />
        <Stack.Screen name="DailyRouteScreen" component={DailyRouteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
