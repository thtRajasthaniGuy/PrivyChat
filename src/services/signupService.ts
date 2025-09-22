import vaultService from './vaultService';
import { userService } from './userService';
import { setItem } from '../utils/storage';

export const signupService = {
  signup: async (
    username: string,
    deviceInfo: {
      deviceId: string;
      deviceIpAddress: string;
      deviceName: string;
      deviceUniqueId: string;
    },
  ) => {
    const available = await userService.isUsernameAvailable(username);
    if (!available)
      return { success: false, message: 'Username already taken' };

    await vaultService.generateUserKey(username);

    const publicId = await vaultService.getPublicId(username);
    await setItem('username', username);
    await setItem('publicId', publicId);

    await userService.createUser({
      username,
      publicId,
      deviceId: deviceInfo?.deviceId,
      deviceIpAddress: deviceInfo?.deviceIpAddress,
      deviceName: deviceInfo?.deviceName,
      deviceUniqueId: deviceInfo?.deviceUniqueId,
    });

    return { success: true, publicId };
  },
};
