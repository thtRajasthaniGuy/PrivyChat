import firestore from '@react-native-firebase/firestore';

export const userService = {
  isUsernameAvailable: async (username: string) => {
    const snapshot = await firestore()
      .collection('users')
      .where('username', '==', username)
      .get();

    return snapshot.empty;
  },

  createUser: async (data: {
    username: string;
    publicId: string;
    deviceId: string;
    deviceIpAddress: string;
    deviceName: string;
    deviceUniqueId: string;
  }) => {
    await firestore().collection('users').doc(data.publicId).set(data);
  },
};
