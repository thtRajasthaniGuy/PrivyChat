import vaultService from './vaultService';
import { userService } from './userService';

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

    await userService.createUser({
      username: username.toLowerCase(),
      publicId,
      deviceId: deviceInfo?.deviceId,
      deviceIpAddress: deviceInfo?.deviceIpAddress,
      deviceName: deviceInfo?.deviceName,
      deviceUniqueId: deviceInfo?.deviceUniqueId,
    });

    return { success: true, publicId };
  },
};
