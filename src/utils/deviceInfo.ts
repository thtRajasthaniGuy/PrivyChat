import DeviceInfo from 'react-native-device-info';

export const getDeviceInfo = async () => {
  const deviceInfo = {
    deviceId: await DeviceInfo.getDeviceId(),
    deviceName: await DeviceInfo.getDeviceName(),
    deviceUniqueId: await DeviceInfo.getUniqueId(),
    deviceIpAddress: await DeviceInfo.getIpAddress(),
  };

  return deviceInfo;
};
