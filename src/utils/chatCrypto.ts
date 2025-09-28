import CryptoVault from 'react-native-crypto-vault';

/**
 * Derive a unique AES key per message from shared key
 * Uses consistent padding to avoid key derivation issues
 */
export const deriveMessageKey = async (
  sharedChatKey: string,
  messageCounter: number,
): Promise<string> => {
  // Pad counter to avoid collision issues (e.g., "1" vs "10")
  const counterStr = messageCounter.toString().padStart(10, '0');

  console.log(
    `🔐 Deriving key: counter=${counterStr}, sharedKey=${sharedChatKey}`,
  );

  // Derive message-specific key using HMAC-SHA256
  const derivedKey = await CryptoVault.hmacSHA256(counterStr, sharedChatKey);

  console.log(`🔐 Derived key: ${derivedKey}`);

  return derivedKey;
};
