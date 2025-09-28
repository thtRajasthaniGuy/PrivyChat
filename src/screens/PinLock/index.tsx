import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { Pri_TextInput } from '../../components';
import CryptoVault from 'react-native-crypto-vault';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/authSlice';
import { getItem } from '../../utils/storage';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
interface props {
  navigation: NavigationProp<ParamListBase>;
  route: Record<string, any>;
}
export const PinLock = ({ navigation, route }: props) => {
  console.log('pinlock props', route?.params);
  const [userPin, setUserPin] = useState('');
  const dispatch = useDispatch();
  const setPinLock = async () => {
    console.log('setPinLock');
    try {
      await CryptoVault.setVaultPin(userPin);
      await CryptoVault.setVaultPolicy('PIN');
      const u = (await getItem('username')) ?? '';
      const p = (await getItem('publicId')) ?? '';
      dispatch(setUser({ username: u, publicId: p }));
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.log('pin set error', error);
    }
  };

  const unlockTheValult = async () => {
    try {
      await CryptoVault.unlockVault(userPin);
      console.log('✅ Vault unlocked with PIN');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.log('unlockTheValult', error);
    }
  };
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>
        {route?.params?.flow === 'login'
          ? 'please enter your pin to unlock the app'
          : 'Please Enter You Pin so is lock our app'}
      </Text>
      <Pri_TextInput
        label="Pin"
        placeholder="Enter your Pin"
        value={userPin}
        onChangeText={val => setUserPin(val)}
        // error={error}
      />
      <Button
        title={'enter pin'}
        onPress={route?.params?.flow === 'login' ? unlockTheValult : setPinLock}
        disabled={false}
      />
    </View>
  );
};
