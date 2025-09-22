import CryptoVault from 'react-native-crypto-vault';

const vaultService = {
  generateUserKey: async (alias: string) => {
    try {
      const result = await CryptoVault.generateSecureKey(alias);
      console.log(result);
    } catch (err) {
      console.error('Vault generateSecureKey error:', err);
      throw err;
    }
  },

  getPublicId: async (alias: string) => {
    try {
      const hashed = await CryptoVault.hashString(alias);
      return hashed;
    } catch (err) {
      console.error('Vault hashString error:', err);
      throw err;
    }
  },
};

export default vaultService;
