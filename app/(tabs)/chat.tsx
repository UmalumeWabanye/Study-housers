import { ThemedText, ThemedView } from '@/components/themed-components';
import { useUserStatus } from '@/context/UserStatusContext';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



// Mock support categories
const SUPPORT_CATEGORIES = [
  { id: '1', name: 'Maintenance', icon: 'construct', color: '#F59E0B', urgent: false },
  { id: '2', name: 'Emergency', icon: 'warning', color: '#EF4444', urgent: true },
  { id: '3', name: 'Facilities', icon: 'business', color: '#3B82F6', urgent: false },
  { id: '4', name: 'IT Support', icon: 'laptop', color: '#8B5CF6', urgent: false },
  { id: '5', name: 'Cleaning', icon: 'brush', color: '#10B981', urgent: false },
  { id: '6', name: 'General Query', icon: 'help-circle', color: '#6B7280', urgent: false },
];

// Mock chat messages
const CHAT_MESSAGES = [
  {
    id: '1',
    text: 'Hello! I\'m here to help you with any residence-related issues. How can I assist you today?',
    isUser: false,
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    sender: 'Support Team',
    category: 'general',
  },
  {
    id: '2',
    text: 'Hi, the WiFi in my room has been very slow for the past few days. Can someone help?',
    isUser: true,
    timestamp: new Date(Date.now() - 55 * 60 * 1000), // 55 minutes ago
    category: 'tech',
  },
  {
    id: '3',
    text: 'I\'ll help you with that WiFi issue. Can you tell me your room number and when you first noticed the slow connection?',
    isUser: false,
    timestamp: new Date(Date.now() - 50 * 60 * 1000), // 50 minutes ago
    sender: 'IT Support',
    category: 'tech',
  },
  {
    id: '4',
    text: 'Room B204, and it started on Monday morning. The connection is very slow especially in the evenings.',
    isUser: true,
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    category: 'tech',
  },
  {
    id: '5',
    text: 'Thanks for the information. I\'ve logged a ticket (#RT001234) for your room. Our IT technician will visit within 24 hours to check the connection. You\'ll receive an SMS with the appointment time.',
    isUser: false,
    timestamp: new Date(Date.now() - 40 * 60 * 1000), // 40 minutes ago
    sender: 'IT Support',
    category: 'tech',
  },
];

// Mock quick replies
const QUICK_REPLIES = [
  'Thank you',
  'When will this be fixed?',
  'I need urgent help',
  'Can you send someone today?',
  'What are the next steps?',
  'Everything is working now',
];

export default function SupportChatScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { userStatus, approvedAccommodation } = useUserStatus();
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // If user is not approved, show different chat experience
  const isApprovedUser = userStatus === 'approved' || userStatus === 'resident';

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = (text: string, category?: string) => {
    if (!text.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
      category: category || selectedCategory || 'general',
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate support response
    setTimeout(() => {
      const responses = [
        'Thanks for reaching out. I\'ve received your message and will get back to you shortly.',
        'Let me check on that for you. I\'ll have an update within the next hour.',
        'I\'ve forwarded your request to the appropriate department. You should hear back soon.',
        'Thank you for the information. I\'m looking into this right away.',
      ];

      const autoResponse = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date(),
        sender: 'Support Team',
        category: category || selectedCategory || 'general',
      };

      setMessages(prev => [...prev, autoResponse]);
    }, 1500);
  };

  const selectCategory = (categoryId: string) => {
    const category = SUPPORT_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;

    setSelectedCategory(categoryId);
    
    if (category.urgent) {
      Alert.alert(
        'Emergency Support',
        'This appears to be an emergency. Would you like to call our 24/7 emergency line instead?',
        [
          { text: 'Continue Chat', style: 'cancel' },
          { text: 'Call Emergency', onPress: () => {
            Alert.alert('Calling...', 'Emergency line: +27 21 650 9111');
          }},
        ]
      );
    }

    const categoryMessage = `I need help with: ${category.name}`;
    sendMessage(categoryMessage, categoryId);
  };

  const formatMessageTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const renderMessage = ({ item }: { item: any }) => {
    return (
      <View style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.supportMessage
      ]}>
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: item.isUser ? colors.primary : colors.surface,
            borderColor: colors.border,
          }
        ]}>
          {!item.isUser && item.sender && (
            <ThemedText variant="tertiary" style={styles.senderName}>
              {item.sender}
            </ThemedText>
          )}
          <ThemedText style={[
            styles.messageText,
            { color: item.isUser ? '#fff' : colors.text }
          ]}>
            {item.text}
          </ThemedText>
          <ThemedText style={[
            styles.messageTime,
            { color: item.isUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
          ]}>
            {formatMessageTime(item.timestamp)}
          </ThemedText>
        </View>
      </View>
    );
  };

  if (!isApprovedUser) {
    // Show different chat for searching users
    return (
      <ThemedView style={styles.container}>
        <View style={[
          styles.header,
          {
            paddingTop: insets.top + 16,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          }
        ]}>
          <ThemedText variant="title" style={styles.headerTitle}>
            General Support
          </ThemedText>
        </View>

        <View style={styles.nonResidentContent}>
          <Ionicons name="chatbubble-outline" size={64} color={colors.iconSecondary} />
          <ThemedText style={styles.nonResidentTitle}>
            Student Support Chat
          </ThemedText>
          <ThemedText variant="secondary" style={styles.nonResidentText}>
            Complete your application and get approved for accommodation to access our dedicated resident support chat.
          </ThemedText>
          <TouchableOpacity
            style={[styles.applicationButton, { backgroundColor: colors.primary }]}
            onPress={() => Alert.alert('Application', 'Navigate to applications screen')}
          >
            <ThemedText style={styles.applicationButtonText}>
              View Applications
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[
        styles.header,
        {
          paddingTop: insets.top + 16,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        }
      ]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <ThemedText variant="title" style={styles.headerTitle}>
              Support Chat
            </ThemedText>
            <ThemedText variant="tertiary" style={styles.headerSubtitle}>
              {approvedAccommodation?.propertyName} • Room {approvedAccommodation?.roomNumber}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={() => Alert.alert('Chat Options', 'Clear chat, export conversation, etc.')}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.iconSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Support Categories */}
        {!selectedCategory && (
          <View style={styles.categoriesContainer}>
            <ThemedText style={styles.categoriesTitle}>How can we help you today?</ThemedText>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContent}
            >
              {SUPPORT_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: `${category.color}15`,
                      borderColor: category.color,
                    }
                  ]}
                  onPress={() => selectCategory(category.id)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                    <Ionicons name={category.icon as any} size={20} color="#fff" />
                  </View>
                  <ThemedText style={[styles.categoryName, { color: category.color }]}>
                    {category.name}
                  </ThemedText>
                  {category.urgent && (
                    <View style={[styles.urgentBadge, { backgroundColor: colors.error }]}>
                      <ThemedText style={styles.urgentText}>24/7</ThemedText>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Quick Replies */}
        {messages.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRepliesContainer}
          >
            {QUICK_REPLIES.map((reply, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quickReplyButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => sendMessage(reply)}
              >
                <ThemedText style={styles.quickReplyText}>{reply}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input */}
        <View style={[
          styles.inputContainer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
          }
        ]}>
          <View style={[
            styles.inputRow,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }
          ]}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="attach" size={20} color={colors.iconSecondary} />
            </TouchableOpacity>
            
            <TextInput
              style={[
                styles.textInput,
                { color: colors.text }
              ]}
              placeholder="Type your message..."
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() ? colors.primary : colors.surface,
                }
              ]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim()}
            >
              <Ionicons 
                name="send" 
                size={18} 
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
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  nonResidentContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  nonResidentTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 16,
    textAlign: 'center',
  },
  nonResidentText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  applicationButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  applicationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoriesContent: {
    gap: 12,
    paddingHorizontal: 4,
  },
  categoryCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 80,
    position: 'relative',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  urgentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  urgentText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  supportMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  senderName: {
    fontSize: 11,
    marginBottom: 4,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    textAlign: 'right',
  },
  quickRepliesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  quickReplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickReplyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  attachButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});