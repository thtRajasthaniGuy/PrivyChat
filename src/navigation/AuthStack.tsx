// src/navigation/AuthStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Signup } from '../screens/Signup';
import { PinLock } from '../screens/PinLock';

const Stack = createNativeStackNavigator();

const authScreens = [
  { name: 'Signup', component: Signup },
  { name: 'PinLock', component: PinLock },
];

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {authScreens.map(screen => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
        />
      ))}
    </Stack.Navigator>
  );
}
