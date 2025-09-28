import CryptoVault from 'react-native-crypto-vault';

/**
 * Generate IDENTICAL shared chat key on both devices
 * This ensures consistent encryption/decryption across all scenarios
 */
export const getSharedChatKey = async (
  myUserName: string,
  otherUserName: string,
) => {
  // Always sort usernames to ensure same order on both devices
  const [u1, u2] = [myUserName, otherUserName].sort();
  const alias = `chat_${u1}_${u2}`;

  // Create deterministic seed from sorted usernames
  const seed = `${u1}:${u2}`;

  // Use application-specific salt for additional security
  const APP_SALT = 'MySecureChatApp2024'; // Change this to your app name

  // Generate deterministic shared key using HMAC-SHA256
  // This will produce IDENTICAL results on both devices
  const sharedChatKey = await CryptoVault.hmacSHA256(seed, APP_SALT);

  console.log(
    `🔑 Generated sharedChatKey for ${u1} <-> ${u2}: ${sharedChatKey}`,
  );

  return {
    alias,
    sharedChatKey, // This will be identical on both devices
  };
};
