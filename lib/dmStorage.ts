import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DMMessage {
  id: string;
  text: string;
  timestamp: Date;
  isFromHost: boolean;
  senderName: string;
}

export interface DMConversation {
  id: string;
  contactName: string;
  propertyTitle: string;
  propertyId: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isArchived: boolean;
  messages: DMMessage[];
}

const DM_STORAGE_KEY = 'dm_conversations';

export class DMStorage {
  static async getAllConversations(): Promise<DMConversation[]> {
    try {
      const data = await AsyncStorage.getItem(DM_STORAGE_KEY);
      if (data) {
        const conversations = JSON.parse(data);
        // Convert timestamp strings back to Date objects
        return conversations.map((conv: any) => ({
          ...conv,
          lastMessageTime: new Date(conv.lastMessageTime),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting DM conversations:', error);
      return [];
    }
  }

  static async getConversation(conversationId: string): Promise<DMConversation | null> {
    try {
      const conversations = await this.getAllConversations();
      return conversations.find(conv => conv.id === conversationId) || null;
    } catch (error) {
      console.error('Error getting DM conversation:', error);
      return null;
    }
  }

  static async saveConversation(conversation: DMConversation): Promise<void> {
    try {
      const conversations = await this.getAllConversations();
      const existingIndex = conversations.findIndex(conv => conv.id === conversation.id);
      
      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation;
      } else {
        conversations.push(conversation);
      }
      
      // Sort by last message time (newest first)
      conversations.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
      
      await AsyncStorage.setItem(DM_STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving DM conversation:', error);
    }
  }

  static async addMessageToConversation(
    conversationId: string,
    message: DMMessage,
    contactName: string,
    propertyTitle: string,
    propertyId: string
  ): Promise<void> {
    try {
      let conversation = await this.getConversation(conversationId);
      
      if (!conversation) {
        // Create new conversation
        conversation = {
          id: conversationId,
          contactName,
          propertyTitle,
          propertyId,
          lastMessage: message.text,
          lastMessageTime: message.timestamp,
          unreadCount: message.isFromHost ? 1 : 0,
          isArchived: false,
          messages: [message],
        };
      } else {
        // Update existing conversation
        conversation.messages.push(message);
        conversation.lastMessage = message.text;
        conversation.lastMessageTime = message.timestamp;
        
        if (message.isFromHost) {
          conversation.unreadCount += 1;
        }
      }
      
      await this.saveConversation(conversation);
    } catch (error) {
      console.error('Error adding message to conversation:', error);
    }
  }

  static async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      const conversation = await this.getConversation(conversationId);
      if (conversation) {
        conversation.unreadCount = 0;
        await this.saveConversation(conversation);
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }

  static async archiveConversation(conversationId: string): Promise<void> {
    try {
      const conversation = await this.getConversation(conversationId);
      if (conversation) {
        conversation.isArchived = true;
        await this.saveConversation(conversation);
      }
    } catch (error) {
      console.error('Error archiving conversation:', error);
    }
  }

  static async deleteConversation(conversationId: string): Promise<void> {
    try {
      const conversations = await this.getAllConversations();
      const filteredConversations = conversations.filter(conv => conv.id !== conversationId);
      await AsyncStorage.setItem(DM_STORAGE_KEY, JSON.stringify(filteredConversations));
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }

  static async getActiveConversations(): Promise<DMConversation[]> {
    try {
      const conversations = await this.getAllConversations();
      return conversations.filter(conv => !conv.isArchived);
    } catch (error) {
      console.error('Error getting active conversations:', error);
      return [];
    }
  }

  static async getArchivedConversations(): Promise<DMConversation[]> {
    try {
      const conversations = await this.getAllConversations();
      return conversations.filter(conv => conv.isArchived);
    } catch (error) {
      console.error('Error getting archived conversations:', error);
      return [];
    }
  }

  static generateConversationId(propertyId: string, contactName: string): string {
    return `dm_${propertyId}_${contactName.replace(/\s+/g, '_').toLowerCase()}`;
  }

  static async clearAllConversations(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DM_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing all conversations:', error);
    }
  }
}