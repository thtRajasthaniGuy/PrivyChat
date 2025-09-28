import firestore from '@react-native-firebase/firestore';
import { getItem } from '../utils/storage';
import CryptoVault from 'react-native-crypto-vault';
import { getSharedChatKey } from '../utils/getSharedChatKey';
import { deriveMessageKey } from '../utils/chatCrypto';

export const homeService = {
  searchUser: async (userName: string) => {
    const currentUser = (await getItem('username'))?.toLowerCase();
    if (!userName) return [];

    try {
      const snapshot = await firestore()
        .collection('users')
        .where('username', '==', userName.toLowerCase())
        .limit(20)
        .get();

      return snapshot.docs
        .map(doc => doc.data())
        .filter(user => user?.username !== currentUser);
    } catch (err) {
      console.error('searchUser error:', err);
      return [];
    }
  },

  subscribeToUnreadChats: async (
    currentUser: string,
    callback: (
      chats: {
        chatId: string;
        lastMessage: string;
        sender: string;
        otherUser: string;
        timestamp: any;
      }[],
    ) => void,
  ) => {
    console.log(`🏠 Setting up dynamic chat subscriptions for: ${currentUser}`);

    // Keep track of all chat previews
    const allChatPreviews = new Map<string, any>();
    const messageSubscriptions: (() => void)[] = [];

    // Subscribe to the chats collection to detect new chats dynamically
    const chatsSubscription = firestore()
      .collection('chats')
      .where('participants', 'array-contains', currentUser)
      .onSnapshot(async chatsSnapshot => {
        console.log(
          `🏠 Found ${chatsSnapshot.docs.length} chats for ${currentUser}`,
        );

        // Clean up old message subscriptions
        messageSubscriptions.forEach(unsub => unsub());
        messageSubscriptions.length = 0;

        // Clear old previews for chats that no longer exist
        const currentChatIds = chatsSnapshot.docs.map(doc => doc.id);
        for (const [chatId] of allChatPreviews) {
          if (!currentChatIds.includes(chatId)) {
            allChatPreviews.delete(chatId);
          }
        }

        for (const chatDoc of chatsSnapshot.docs) {
          const chatId = chatDoc.id;
          const participants: string[] = chatDoc.data()?.participants || [];
          const otherUser = participants.find(u => u !== currentUser);

          if (!otherUser) continue;

          console.log(
            `🏠 Setting up message subscription for chat: ${chatId} with ${otherUser}`,
          );

          try {
            // Generate shared key
            const keyResult = await getSharedChatKey(currentUser, otherUser);
            console.log(
              `🏠 Generated key for ${currentUser} <-> ${otherUser}: ${keyResult.sharedChatKey}`,
            );

            // Subscribe to the last message of this chat
            const messageUnsubscribe = firestore()
              .collection('chats')
              .doc(chatId)
              .collection('messages')
              .orderBy('messageCounter', 'desc')
              .limit(1)
              .onSnapshot(async messageSnapshot => {
                if (!messageSnapshot.empty) {
                  const messageDoc = messageSnapshot.docs[0];
                  const data = messageDoc.data();

                  try {
                    console.log(
                      `🏠 Processing last message ${data.messageCounter} in ${chatId}`,
                    );

                    // Use the same key derivation as chat screen
                    const messageKey = await deriveMessageKey(
                      keyResult.sharedChatKey,
                      data.messageCounter,
                    );

                    const decrypted = await CryptoVault.aesGcmDecryptRaw(
                      data.content,
                      messageKey,
                    );

                    console.log(
                      `🏠 Decrypted preview: ${decrypted} from ${data.sender}`,
                    );

                    // Update the preview for this specific chat in the Map
                    allChatPreviews.set(chatId, {
                      chatId,
                      lastMessage: decrypted,
                      sender: data.sender,
                      otherUser,
                      timestamp: data.createdAt,
                    });
                  } catch (err) {
                    console.error(
                      `❌ Failed to decrypt preview message in ${chatId}:`,
                      err,
                    );

                    // Still update with encrypted content
                    allChatPreviews.set(chatId, {
                      chatId,
                      lastMessage: '[Encrypted message]',
                      sender: data.sender,
                      otherUser,
                      timestamp: data.createdAt,
                    });
                  }
                } else {
                  console.log(`🏠 No messages found in ${chatId}`);
                  // Remove from previews if no messages
                  allChatPreviews.delete(chatId);
                }

                // Send all chat previews as an array
                const previews = Array.from(allChatPreviews.values());
                console.log(
                  `🏠 Sending ${previews.length} chat previews to UI`,
                );
                callback(previews);
              });

            messageSubscriptions.push(messageUnsubscribe);
          } catch (error) {
            console.error(
              `❌ Error setting up subscription for ${chatId}:`,
              error,
            );
          }
        }
      });

    // Return cleanup function that unsubscribes from all listeners
    return () => {
      console.log('🏠 Cleaning up chat subscriptions');

      // Clean up message subscriptions
      messageSubscriptions.forEach(unsub => unsub());

      // Clean up main chats subscription
      chatsSubscription();
    };
  },
};
