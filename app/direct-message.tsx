import { ThemedText, ThemedView } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { DMMessage, DMStorage } from '@/lib/dmStorage';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DirectMessageScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { contactName, propertyTitle, propertyId } = useLocalSearchParams();
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [conversationId, setConversationId] = useState<string>('');

  useEffect(() => {
    const initializeConversation = async () => {
      const convId = DMStorage.generateConversationId(
        propertyId as string || 'unknown',
        contactName as string || 'Host'
      );
      setConversationId(convId);

      // Try to load existing conversation
      const existingConversation = await DMStorage.getConversation(convId);
      
      if (existingConversation) {
        setMessages(existingConversation.messages);
        // Mark conversation as read when opened
        await DMStorage.markConversationAsRead(convId);
      } else {
        // Generate automated welcome message for new conversation
        const generateWelcomeMessage = () => {
          const welcomeTexts = [
            `Hi there! 👋 Thanks for your interest in ${propertyTitle}. I'm here to help answer any questions you might have about the property. Feel free to ask about amenities, move-in dates, or anything else!`,
            `Hello! Welcome to our property chat for ${propertyTitle}. I'm excited to help you learn more about this accommodation. What would you like to know?`,
            `Hi! Thanks for reaching out about ${propertyTitle}. I'm the property host and I'm here to assist with any questions or concerns. Looking forward to chatting with you!`,
            `Welcome! 🏠 I see you're interested in ${propertyTitle}. I'm here to provide you with all the information you need. Don't hesitate to ask about anything - from facilities to the application process!`,
          ];
          return welcomeTexts[Math.floor(Math.random() * welcomeTexts.length)];
        };

        const welcomeMessage: DMMessage = {
          id: 'welcome-1',
          text: generateWelcomeMessage(),
          timestamp: new Date(),
          isFromHost: true,
          senderName: (contactName as string) || 'Host',
        };

        setMessages([welcomeMessage]);
        
        // Save the initial conversation with welcome message
        await DMStorage.addMessageToConversation(
          convId,
          welcomeMessage,
          contactName as string || 'Host',
          propertyTitle as string || 'Property',
          propertyId as string || 'unknown'
        );
      }
    };

    if (contactName && propertyTitle) {
      initializeConversation();
    }
  }, [contactName, propertyTitle, propertyId]);

  const sendMessage = async () => {
    if (inputText.trim() && conversationId) {
      const newMessage: DMMessage = {
        id: Date.now().toString(),
        text: inputText.trim(),
        timestamp: new Date(),
        isFromHost: false,
        senderName: 'You',
      };

      setMessages(prev => [...prev, newMessage]);
      setInputText('');

      // Save user message to storage
      await DMStorage.addMessageToConversation(
        conversationId,
        newMessage,
        contactName as string || 'Host',
        propertyTitle as string || 'Property',
        propertyId as string || 'unknown'
      );

      // Simulate host response after a delay
      setTimeout(async () => {
        const hostResponses = [
          "Thanks for your message! I'll get back to you shortly.",
          "Great question! Let me provide you with that information.",
          "I appreciate you reaching out. I'll respond as soon as possible.",
          "Thank you for your interest! I'll be in touch soon.",
        ];
        
        const hostMessage: DMMessage = {
          id: (Date.now() + 1).toString(),
          text: hostResponses[Math.floor(Math.random() * hostResponses.length)],
          timestamp: new Date(),
          isFromHost: true,
          senderName: contactName as string || 'Host',
        };

        setMessages(prev => [...prev, hostMessage]);
        
        // Save host response to storage
        await DMStorage.addMessageToConversation(
          conversationId,
          hostMessage,
          contactName as string || 'Host',
          propertyTitle as string || 'Property',
          propertyId as string || 'unknown'
        );
      }, 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const renderMessage = ({ item }: { item: DMMessage }) => (
    <View
      style={[
        styles.messageContainer,
        item.isFromHost ? styles.hostMessage : styles.userMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: item.isFromHost ? colors.surface : colors.primary,
            borderColor: item.isFromHost ? colors.border : colors.primary,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.messageText,
            { color: item.isFromHost ? colors.text : '#fff' },
          ]}
        >
          {item.text}
        </ThemedText>
        <ThemedText
          style={[
            styles.messageTime,
            { color: item.isFromHost ? colors.textSecondary : 'rgba(255,255,255,0.8)' },
          ]}
        >
          {formatTime(item.timestamp)}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top + 16,
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <ThemedText style={styles.headerTitle} numberOfLines={1}>
                {contactName || 'Host'}
              </ThemedText>
              <ThemedText style={styles.headerSubtitle} variant="tertiary" numberOfLines={1}>
                {propertyTitle}
              </ThemedText>
            </View>
            
            <TouchableOpacity style={styles.headerAction}>
              <Ionicons name="information-circle-outline" size={24} color={colors.iconSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          inverted={false}
        />

        {/* Input */}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() ? colors.primary : colors.surface,
                },
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? '#fff' : colors.iconSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  headerAction: {
    padding: 4,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 20,
    gap: 16,
  },
  messageContainer: {
    maxWidth: '80%',
  },
  hostMessage: {
    alignSelf: 'flex-start',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    textAlign: 'right',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 120,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});