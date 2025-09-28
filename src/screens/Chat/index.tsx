import { NavigationProp, ParamListBase } from '@react-navigation/native';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { getItem } from '../../utils/storage';
import { getSharedChatKey } from '../../utils/getSharedChatKey';
import { chatService } from '../../services/chatService';

interface Props {
  navigation: NavigationProp<ParamListBase>;
  route: Record<string, any>;
}

export const Chat = ({ route }: Props) => {
  const param = route?.params?.data;
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState('');
  const [sharedChatKey, setSharedChatKey] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!param?.username) return;

    const initChat = async () => {
      try {
        setIsLoading(true);

        const myUserName = await getItem('username');
        if (!myUserName) return;

        setCurrentUser(myUserName);
        console.log(
          `💬 Initializing chat: ${myUserName} <-> ${param.username}`,
        );

        // 1️⃣ Get shared chat key
        const keyResult = await getSharedChatKey(myUserName, param.username);
        setSharedChatKey(keyResult.sharedChatKey);
        console.log(`💬 Shared key generated: ${keyResult.sharedChatKey}`);

        // 2️⃣ Get or create chat doc
        const { chatId } = await chatService.getOrCreateChat(param.username);
        setChatId(chatId);
        console.log(`💬 Chat ID: ${chatId}`);

        // 3️⃣ Subscribe to messages
        const unsubscribe = chatService.subscribeToMessages(
          chatId,
          keyResult.sharedChatKey,
          newMessages => {
            console.log(`💬 Received ${newMessages.length} messages`);
            setMessages(newMessages);

            // Auto scroll to bottom when new messages arrive
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          },
        );

        unsubscribeRef.current = unsubscribe;
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Chat initialization error:', error);
        setIsLoading(false);
      }
    };

    initChat();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [param?.username]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || !sharedChatKey || !chatId || !currentUser) {
      console.log('❌ Cannot send message: missing data', {
        hasInput: !!input.trim(),
        hasKey: !!sharedChatKey,
        hasChatId: !!chatId,
        hasUser: !!currentUser,
      });
      return;
    }

    try {
      console.log(`📤 Sending message: "${input}" from ${currentUser}`);

      await chatService.sendMessage(
        chatId,
        input.trim(),
        currentUser,
        sharedChatKey,
      );

      setInput('');
    } catch (error) {
      console.error('❌ Send message error:', error);
    }
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isMyMessage = item.sender === currentUser;
    const isOtherUser = item.sender === param.username;

    return (
      <View
        style={{
          padding: 12,
          marginVertical: 4,
          marginHorizontal: 16,
          alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
          backgroundColor: isMyMessage ? '#4caf50' : '#eee',
          borderRadius: 12,
          maxWidth: '80%',
        }}
      >
        <Text
          style={{
            color: isMyMessage ? '#fff' : '#000',
            fontSize: 16,
          }}
        >
          {item.content}
        </Text>
        {/* <Text
          style={{
            color: isMyMessage ? '#fff' : '#666',
            fontSize: 10,
            marginTop: 4,
            alignSelf: 'flex-end',
          }}
        >
          {item.messageCounter} • {item.sender}
        </Text> */}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading chat...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, marginBottom: 16, textAlign: 'center' }}>
        Chat with {param?.username}
      </Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />

      <View
        style={{
          flexDirection: 'row',
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: '#eee',
        }}
      >
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 12,
            borderRadius: 8,
            marginRight: 8,
          }}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          multiline
          maxLength={500}
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </View>
  );
};
