import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import { Pri_TextInput } from '../../components';
import { signupService } from '../../services/signupService';

import { getDeviceInfo } from '../../utils/deviceInfo';
import { setItem } from '../../utils/storage';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

interface props {
  navigation: NavigationProp<ParamListBase>;
  route: Record<string, any>;
}
export const Signup = (props: props) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckUsername = async () => {
    if (!username) {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }
    setLoading(true);
    try {
      const deviceInfo = await getDeviceInfo();
      const { success, publicId, message }: any = await signupService.signup(
        username,
        deviceInfo,
      );

      if (success) {
        await setItem('username', username);
        await setItem('publicId', publicId);
        props.navigation.navigate('PinLock', { flow: 'signup' });
      } else {
        Alert.alert('Error', message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Vault or Firebase error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Pri_TextInput
        label="Username"
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
        error={error}
      />
      <Button
        title={loading ? 'Checking...' : 'Check Username'}
        onPress={handleCheckUsername}
        disabled={loading}
      />
    </View>
  );
};
