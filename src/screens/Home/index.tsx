import { View, Text, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useState, useEffect, useRef } from 'react';
import { homeService } from '../../services/homeService';
import { searchDebounce } from '../../utils/search';
import { Pri_TextInput } from '../../components';
import { styles } from './styles';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import CryptoVault from 'react-native-crypto-vault';
import { getItem } from '../../utils/storage';

interface Props {
  navigation: NavigationProp<ParamListBase>;
  route: Record<string, any>;
}

export const Home = ({ navigation }: Props) => {
  const [userName, setUserName] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Vault check
  const checkIsVaultLocked = async () => {
    try {
      const isVaultLocked = await CryptoVault.isVaultLocked();
      if (isVaultLocked) {
        navigation.navigate('PinLock', { flow: 'login' });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIsVaultLocked();
  }, []);

  // Debounced search - only updates search results
  const debouncedSearch = useRef(
    searchDebounce(async (text: string) => {
      if (!text) {
        setSearchResults([]);
        return;
      }
      const users = await homeService.searchUser(text);
      setSearchResults(users);
    }, 300),
  ).current;

  useEffect(() => {
    debouncedSearch(userName);
  }, [userName]);

  // Set up chat subscriptions for recent chats
  useEffect(() => {
    const initSubscription = async () => {
      const myUserName = await getItem('username');
      if (!myUserName) return;

      const unsubscribe = await homeService.subscribeToUnreadChats(
        myUserName,
        newChats => {
          console.log('📱 Received chat updates:', newChats);

          // Update recent chats state
          setRecentChats(prevChats => {
            const updatedChats = [...prevChats];

            newChats.forEach(chat => {
              const existingIndex = updatedChats.findIndex(
                c => c.username === chat.otherUser,
              );

              const chatData = {
                username: chat.otherUser,
                publicId: chat.otherUser, // Use username as publicId for navigation
                lastMessage: chat.lastMessage,
                sender: chat.sender,
                chatId: chat.chatId,
              };

              if (existingIndex >= 0) {
                // Update existing chat
                updatedChats[existingIndex] = chatData;
              } else {
                // Add new chat
                updatedChats.push(chatData);
              }
            });

            return updatedChats;
          });
        },
      );

      unsubscribeRef.current = unsubscribe;
    };

    initSubscription();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Combine search results and recent chats for display
  const displayData = userName ? searchResults : recentChats;

  const renderUserItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => navigation.navigate('Chat', { data: item })}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{item?.username}</Text>
          {item?.lastMessage && (
            <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
              {item.sender}: {item.lastMessage.substring(0, 30)}
              {item.lastMessage.length > 30 ? '...' : ''}
            </Text>
          )}
        </View>
        {item?.lastMessage && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#4caf50',
              marginLeft: 8,
            }}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Pri_TextInput
        label="Username"
        placeholder="Search your user"
        value={userName}
        onChangeText={setUserName}
      />

      <FlashList
        data={displayData}
        keyExtractor={item => item?.publicId || item?.username}
        renderItem={renderUserItem}
        ListEmptyComponent={
          userName ? (
            <Text style={styles.noResult}>No users found</Text>
          ) : (
            <Text style={styles.noResult}>No recent chats</Text>
          )
        }
        //estimatedItemSize={60}
      />
    </View>
  );
};
