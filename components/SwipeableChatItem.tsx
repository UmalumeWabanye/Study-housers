import { ThemedText } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { DMConversation } from '@/lib/dmStorage';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
    Animated,
    Dimensions,
    PanResponder,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.25;
const ACTION_WIDTH = 80;

interface SwipeableChatItemProps {
  conversation: DMConversation;
  onPress: (conversation: DMConversation) => void;
  onDelete: (conversation: DMConversation) => void;
  onArchive: (conversation: DMConversation) => void;
}

export default function SwipeableChatItem({
  conversation,
  onPress,
  onDelete,
  onArchive,
}: SwipeableChatItemProps) {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },

    onPanResponderMove: (_, gestureState) => {
      // Constrain the swipe between delete (left) and archive (right)
      const clampedTranslation = Math.max(
        -ACTION_WIDTH,
        Math.min(ACTION_WIDTH, gestureState.dx)
      );

      translateX.setValue(clampedTranslation);
    },

    onPanResponderRelease: (_, gestureState) => {
      const { dx, vx } = gestureState;

      // Determine action based on swipe distance and velocity
      const shouldDelete = dx < -SWIPE_THRESHOLD || vx < -0.5;
      const shouldArchive = dx > SWIPE_THRESHOLD || vx > 0.5;

      if (shouldDelete) {
        // Animate to delete position then trigger delete
        Animated.timing(translateX, {
          toValue: -screenWidth,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onDelete(conversation));
      } else if (shouldArchive) {
        // Animate to archive position then trigger archive
        Animated.timing(translateX, {
          toValue: screenWidth,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onArchive(conversation));
      } else {
        // Snap back to center
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    },
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return minutes <= 1 ? 'now' : `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return days === 1 ? '1d ago' : `${days}d ago`;
    }
  };

  const handleItemPress = () => {
    // Reset position first
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    
    onPress(conversation);
  };

  return (
    <View style={styles.container}>
      {/* Background Actions */}
      <View style={[styles.actionsContainer, { backgroundColor: colors.surface }]}>
        {/* Archive Action (Right) */}
        <View style={[styles.actionContainer, styles.archiveAction]}>
          <View style={[styles.actionButton, { backgroundColor: colors.warning || '#FF9500' }]}>
            <Ionicons name="archive" size={20} color="#fff" />
          </View>
          <ThemedText style={styles.actionText} variant="tertiary">
            Archive
          </ThemedText>
        </View>

        {/* Delete Action (Left) */}
        <View style={[styles.actionContainer, styles.deleteAction]}>
          <View style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}>
            <Ionicons name="trash" size={20} color="#fff" />
          </View>
          <ThemedText style={styles.actionText} variant="tertiary">
            Delete
          </ThemedText>
        </View>
      </View>

      {/* Main Chat Item */}
      <Animated.View
        style={[
          styles.chatItem,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.cardBorder,
            shadowColor: colors.shadow,
            shadowOpacity: colors.shadowOpacity,
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.chatContent}
          onPress={handleItemPress}
          activeOpacity={0.7}
        >
          <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
            <Ionicons name="person" size={24} color={colors.iconSecondary} />
          </View>
          
          <View style={styles.conversationInfo}>
            <View style={styles.conversationHeader}>
              <ThemedText style={styles.conversationName} variant="default" numberOfLines={1}>
                {conversation.contactName}
              </ThemedText>
              <ThemedText style={styles.conversationTime} variant="tertiary">
                {formatTime(conversation.lastMessageTime)}
              </ThemedText>
            </View>
            
            <ThemedText style={styles.propertyTitle} variant="tertiary" numberOfLines={1}>
              {conversation.propertyTitle}
            </ThemedText>
            
            <ThemedText style={styles.lastMessage} variant="secondary" numberOfLines={2}>
              {conversation.lastMessage}
            </ThemedText>
          </View>
          
          {conversation.unreadCount > 0 && (
            <View style={styles.unreadContainer}>
              <View style={[styles.unreadIndicator, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.unreadText}>
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </ThemedText>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  actionContainer: {
    alignItems: 'center',
    width: ACTION_WIDTH,
  },
  archiveAction: {
    alignSelf: 'flex-start',
  },
  deleteAction: {
    alignSelf: 'flex-end',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
  },
  chatItem: {
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  conversationTime: {
    fontSize: 12,
    marginLeft: 8,
  },
  propertyTitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    lineHeight: 18,
  },
  unreadContainer: {
    marginLeft: 8,
  },
  unreadIndicator: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});