import { ThemedText } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { SearchStorage, SearchSuggestion } from '@/lib/searchStorage';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Keyboard,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface PredictiveSearchProps {
  onSearch: (query: string) => void;
  onAdvancedSearch: () => void;
  placeholder?: string;
  initialQuery?: string;
}

export default function PredictiveSearch({
  onSearch,
  onAdvancedSearch,
  placeholder = "Search for accommodation...",
  initialQuery = "",
}: PredictiveSearchProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const loadSuggestions = useCallback(async (searchQuery: string) => {
    try {
      setIsLoading(true);
      const filteredSuggestions = await SearchStorage.getFilteredSuggestions(searchQuery);
      setSuggestions(filteredSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load initial suggestions when component mounts
    loadSuggestions('');
  }, [loadSuggestions]);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounce suggestions loading
    timeoutRef.current = setTimeout(() => {
      loadSuggestions(text);
    }, 200);
    
    // Show suggestions when typing
    if (!showSuggestions) {
      setShowSuggestions(true);
    }
  };

  const handleSearch = async (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      // Add to search history
      await SearchStorage.addSearchToHistory(searchQuery.trim());
      
      // Execute search
      onSearch(searchQuery.trim());
      
      // Hide suggestions and dismiss keyboard
      setShowSuggestions(false);
      Keyboard.dismiss();
      inputRef.current?.blur();
    }
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    const searchText = suggestion.text;
    setQuery(searchText);
    handleSearch(searchText);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
    // Reload suggestions on focus to get fresh data
    loadSuggestions(query);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for suggestion taps
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'location':
        return 'location-outline';
      case 'university':
        return 'school-outline';
      case 'property_type':
        return 'home-outline';
      case 'amenity':
        return 'checkmark-circle-outline';
      default:
        return 'search-outline';
    }
  };

  const getSuggestionTypeLabel = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'location':
        return 'Location';
      case 'university':
        return 'University';
      case 'property_type':
        return 'Property Type';
      case 'amenity':
        return 'Amenity';
      default:
        return '';
    }
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => {
    const isFromHistory = item.id.startsWith('history_');
    
    return (
      <TouchableOpacity
        style={[styles.suggestionItem, { borderBottomColor: colors.border }]}
        onPress={() => handleSuggestionPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.suggestionIcon}>
          <Ionicons
            name={isFromHistory ? "time-outline" : getSuggestionIcon(item.type)}
            size={20}
            color={isFromHistory ? colors.warning : colors.iconSecondary}
          />
        </View>
        
        <View style={styles.suggestionContent}>
          <ThemedText style={styles.suggestionText} numberOfLines={1}>
            {item.text}
          </ThemedText>
          {!isFromHistory && item.type !== 'general' && (
            <ThemedText variant="tertiary" style={styles.suggestionType}>
              {getSuggestionTypeLabel(item.type)}
            </ThemedText>
          )}
          {isFromHistory && (
            <ThemedText variant="tertiary" style={styles.suggestionType}>
              Recent search
            </ThemedText>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.suggestionAction}
          onPress={() => handleSuggestionPress(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-up-outline" size={16} color={colors.iconSecondary} style={{ transform: [{ rotate: '45deg' }] }} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={[styles.searchContainer, { 
        backgroundColor: colors.surface,
        borderColor: showSuggestions ? colors.primary : colors.border,
      }]}>
        <Ionicons name="search" size={20} color={colors.iconSecondary} style={styles.searchIcon} />
        
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={handleQueryChange}
          onSubmitEditing={() => handleSearch()}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.iconSecondary} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={onAdvancedSearch} style={styles.filterButton}>
          <Ionicons name="options" size={20} color={colors.iconSecondary} />
        </TouchableOpacity>
      </View>

      {/* Suggestions List */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { 
          backgroundColor: colors.background,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        }]}>
          <ScrollView
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {suggestions.map((item) => (
              <View key={item.id}>
                {renderSuggestion({ item })}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* No Results */}
      {showSuggestions && suggestions.length === 0 && !isLoading && query.length > 0 && (
        <View style={[styles.noResultsContainer, { 
          backgroundColor: colors.background,
          borderColor: colors.border,
        }]}>
          <ThemedText variant="secondary" style={styles.noResultsText}>
            {`No suggestions found for '${query}'`}
          </ThemedText>
          <TouchableOpacity
            style={[styles.searchAnywayButton, { borderColor: colors.border }]}
            onPress={() => handleSearch()}
          >
            <ThemedText style={[styles.searchAnywayText, { color: colors.primary }]}>
              Search anyway
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    padding: 4,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 16,
    marginBottom: 2,
  },
  suggestionType: {
    fontSize: 12,
  },
  suggestionAction: {
    padding: 8,
    marginLeft: 8,
  },
  noResultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  noResultsText: {
    textAlign: 'center',
    marginBottom: 12,
  },
  searchAnywayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  searchAnywayText: {
    fontSize: 14,
    fontWeight: '500',
  },
});