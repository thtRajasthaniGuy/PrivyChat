// src/navigation/AppStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home } from '../screens/Home';
// import Profile from '../screens/Profile';
// import Chat from '../screens/Chat';

const Stack = createNativeStackNavigator();

const appScreens = [
  { name: 'Home', component: Home },
  //   { name: 'Profile', component: Profile },
  //   { name: 'Chat', component: Chat },
];

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {appScreens.map(screen => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
        />
      ))}
    </Stack.Navigator>
  );
}
