import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CryptoVault from 'react-native-crypto-vault';

export const useVaultAutoLock = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    let appState: any = AppState.currentState;

    const handleAppStateChange = async (nextAppState: string) => {
      if (
        appState.match(/active/) &&
        nextAppState.match(/inactive|background/)
      ) {
        // App goes to background → lock vault
        await CryptoVault.lockVault();
        console.log('🔒 Vault locked due to app going to background');

        // Navigate to PinLock if app is unlocked before
        navigation.navigate('PinLock', { flow: 'login' });
      }
      appState = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [navigation]);
};
