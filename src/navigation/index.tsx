// src/navigation/index.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

export default function RootNavigator() {
  const { username, publicId } = useSelector((state: RootState) => state.auth);
  return username && publicId ? <AppStack /> : <AuthStack />;
}
