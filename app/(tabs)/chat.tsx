import SwipeableChatItem from '@/components/SwipeableChatItem';
import { ThemedText, ThemedView } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { DMConversation, DMStorage } from '@/lib/dmStorage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [conversations, setConversations] = useState<DMConversation[]>([]);

  const loadConversations = useCallback(async () => {
    try {
      const activeConversations = await DMStorage.getActiveConversations();
      setConversations(activeConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [loadConversations])
  );

  const handleConversationPress = (conversation: DMConversation) => {
    router.push({
      pathname: '/direct-message',
      params: {
        contactName: conversation.contactName,
        propertyTitle: conversation.propertyTitle,
        propertyId: conversation.propertyId,
      },
    });
  };

  const handleDeleteConversation = (conversation: DMConversation) => {
    Alert.alert(
      'Delete Conversation',
      `Are you sure you want to delete your conversation with ${conversation.contactName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await DMStorage.deleteConversation(conversation.id);
            loadConversations();
          },
        },
      ]
    );
  };

  const handleArchiveConversation = async (conversation: DMConversation) => {
    await DMStorage.archiveConversation(conversation.id);
    loadConversations();
  };

  const renderConversation = ({ item }: { item: DMConversation }) => (
    <SwipeableChatItem
      conversation={item}
      onPress={handleConversationPress}
      onDelete={handleDeleteConversation}
      onArchive={handleArchiveConversation}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="title">Messages</ThemedText>
          {/* Temporary clear button for development */}
          {conversations.length > 0 && (
            <TouchableOpacity
              onPress={async () => {
                Alert.alert(
                  'Clear All Conversations',
                  'Are you sure you want to delete all conversations?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Clear All',
                      style: 'destructive',
                      onPress: async () => {
                        await DMStorage.clearAllConversations();
                        loadConversations();
                      },
                    },
                  ]
                );
              }}
              style={styles.clearButton}
            >
              <Ionicons name="trash-outline" size={20} color={colors.accent || '#FF3B30'} />
              <ThemedText variant="secondary" style={styles.clearText}>
                Clear All
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Conversations List */}
        {conversations.length > 0 ? (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.conversationsList,
              { paddingBottom: insets.bottom + 20 },
            ]}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          /* Empty State */
          <View style={styles.emptyState}>
            <Ionicons
              name="chatbubbles-outline"
              size={64}
              color={colors.iconSecondary}
              style={{ marginBottom: 16 }}
            />
            <ThemedText variant="subtitle" style={styles.emptyTitle}>
              No conversations yet
            </ThemedText>
            <ThemedText variant="tertiary" style={styles.emptySubtitle}>
              Start chatting with property hosts by viewing property details and tapping the chat button.
            </ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  clearText: {
    fontSize: 14,
  },
  conversationsList: {
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});