import firestore from '@react-native-firebase/firestore';
import { getItem } from '../utils/storage';
import CryptoVault from 'react-native-crypto-vault';
import { deriveMessageKey } from '../utils/chatCrypto';

export const chatService = {
  getOrCreateChat: async (otherUserName: string) => {
    const myUserName = await getItem('username');
    if (!myUserName || myUserName === otherUserName)
      throw new Error('Invalid chat participants');

    const chatId = 'chat_' + [myUserName, otherUserName].sort().join('_');
    const chatDocRef = firestore().collection('chats').doc(chatId);

    const doc = await chatDocRef.get({ source: 'server' });
    if (!doc.exists()) {
      await chatDocRef.set({
        participants: [myUserName, otherUserName],
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastMessageCounter: -1, // Initialize counter
      });
    }

    return { chatDocRef, chatId };
  },

  getLastMessageCounter: async (chatId: string) => {
    try {
      // First try to get from chat document (more reliable)
      const chatDoc = await firestore().collection('chats').doc(chatId).get();
      if (
        chatDoc.exists() &&
        chatDoc.data()?.lastMessageCounter !== undefined
      ) {
        return chatDoc.data()?.lastMessageCounter;
      }

      // Fallback: get from messages collection
      const snapshot = await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('messageCounter', 'desc')
        .limit(1)
        .get();

      if (!snapshot.empty) {
        return snapshot.docs[0].data().messageCounter;
      }
      return -1;
    } catch (error) {
      console.error('Error getting last message counter:', error);
      return -1;
    }
  },

  sendMessage: async (
    chatId: string,
    message: string,
    sender: string,
    sharedChatKey: string,
  ) => {
    try {
      console.log(
        `📤 Sending message from ${sender} with key: ${sharedChatKey}`,
      );

      // Get next counter atomically using transaction
      const nextCounter = await firestore().runTransaction(
        async transaction => {
          const chatRef = firestore().collection('chats').doc(chatId);
          const chatDoc = await transaction.get(chatRef);

          if (!chatDoc.exists()) {
            throw new Error('Chat document does not exist');
          }

          const currentCounter = chatDoc.data()?.lastMessageCounter ?? -1;
          const nextCounter = currentCounter + 1;

          console.log(
            `📤 Current counter: ${currentCounter}, Next: ${nextCounter}`,
          );

          // Update the counter in chat document
          transaction.update(chatRef, {
            lastMessageCounter: nextCounter,
            lastActivity: firestore.FieldValue.serverTimestamp(),
          });

          return nextCounter;
        },
      );

      console.log(`📤 Using message counter: ${nextCounter}`);

      // Derive message-specific key
      const messageKey = await deriveMessageKey(sharedChatKey, nextCounter);
      console.log(`📤 Derived message key: ${messageKey}`);

      // Encrypt message
      const encryptedMessage = await CryptoVault.aesGcmEncryptRaw(
        message,
        messageKey,
      );

      console.log(`📤 Encrypted message: ${encryptedMessage}`);

      // Store encrypted message with the counter we got from transaction
      await firestore()
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .add({
          sender,
          content: encryptedMessage,
          messageCounter: nextCounter,
          createdAt: firestore.FieldValue.serverTimestamp(),
          type: 'text',
        });

      console.log(`✅ Message ${nextCounter} sent successfully`);
    } catch (error) {
      console.error('❌ Send message error:', error);
      throw error;
    }
  },

  subscribeToMessages: (
    chatId: string,
    sharedChatKey: string,
    callback: (messages: any[]) => void,
  ) => {
    console.log(`📥 Subscribing to messages with key: ${sharedChatKey}`);

    return firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('messageCounter', 'asc') // Order by message counter, not timestamp
      .onSnapshot(async snapshot => {
        console.log(`📥 Received ${snapshot.docs.length} messages`);
        const decryptedMessages: any[] = [];

        for (const doc of snapshot.docs) {
          const data = doc.data();
          try {
            console.log(`📥 Decrypting message ${data.messageCounter}`);

            const messageKey = await deriveMessageKey(
              sharedChatKey,
              data.messageCounter,
            );

            console.log(
              `📥 Message key for ${data.messageCounter}: ${messageKey}`,
            );

            const decryptedText = await CryptoVault.aesGcmDecryptRaw(
              data.content,
              messageKey,
            );

            console.log(`📥 Decrypted: ${decryptedText}`);

            decryptedMessages.push({
              id: doc.id,
              sender: data.sender,
              content: decryptedText,
              messageCounter: data.messageCounter,
              createdAt: data.createdAt,
              type: data.type || 'text',
            });
          } catch (error) {
            console.error(`❌ Failed to decrypt message ${doc.id}:`, error);
            console.error('Error details:', {
              messageCounter: data.messageCounter,
              sender: data.sender,
              chatId,
            });

            // Still add the message with error indication
            decryptedMessages.push({
              id: doc.id,
              sender: data.sender,
              content: '[Failed to decrypt message]',
              messageCounter: data.messageCounter,
              createdAt: data.createdAt,
              type: 'error',
            });
          }
        }

        // Sort by message counter to ensure correct order (ascending = oldest first)
        decryptedMessages.sort((a, b) => a.messageCounter - b.messageCounter);

        console.log(
          '📥 Final message order:',
          decryptedMessages.map(m => ({
            counter: m.messageCounter,
            content: m.content,
            sender: m.sender,
          })),
        );

        callback(decryptedMessages);
      });
  },
};
