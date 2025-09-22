import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store, RootState } from './src/store';
import { getItem } from './src/utils/storage';
import { ActivityIndicator, View } from 'react-native';
import { setUser } from './src/store/authSlice';
import AppStack from './src/navigation/AppStack';
import AuthStack from './src/navigation/AuthStack';

function Root() {
  const dispatch = useDispatch();
  const { username, publicId } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const u = getItem('username');
      const p = getItem('publicId');
      if (u && p) {
        dispatch(setUser({ username: u, publicId: p }));
      }
      setLoading(false);
    };
    init();
  }, [dispatch]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (username && publicId) {
    return <AppStack />;
  } else {
    return <AuthStack />;
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <NavigationContainer>
          <Root />
        </NavigationContainer>
      </Provider>
    </SafeAreaProvider>
  );
}
