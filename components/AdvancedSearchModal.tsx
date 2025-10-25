import { ThemedText, ThemedView } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { SearchFilters } from '@/lib/searchStorage';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AdvancedSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: SearchFilters) => void;
  initialFilters: SearchFilters;
}

const ROOM_TYPES = ['Single', 'Double', 'Shared', 'En-suite', 'Studio'];
const PROPERTY_TYPES = ['Residence Room', 'Shared Flat', 'Studio Apartment', 'Co-Living Space', 'Traditional Digs', 'Bachelor Flat'];
const LOCATIONS = ['Observatory', 'Rondebosch', 'Claremont', 'Mowbray', 'Woodstock', 'Cape Town CBD', 'Bellville', 'Stellenbosch', 'Braamfontein', 'Melville'];
const UNIVERSITIES = ['University of Cape Town', 'University of the Witwatersrand', 'Stellenbosch University', 'Cape Peninsula University of Technology', 'University of Johannesburg'];
const AMENITIES = ['WiFi included', 'Parking available', 'Gym access', '24/7 Security', 'Laundry facilities', 'Study areas', 'Kitchen access', 'Air conditioning', 'Cleaning service', 'Meal plan available'];

export default function AdvancedSearchModal({
  visible,
  onClose,
  onApplyFilters,
  initialFilters,
}: AdvancedSearchModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  const updateFilters = (updates: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Filters',
      'Are you sure you want to reset all filters to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setFilters({
              priceRange: { min: 0, max: 20000 },
              roomTypes: [],
              locations: [],
              universities: [],
              amenities: [],
              propertyTypes: [],
              availability: 'any',
              furnished: 'any',
              parking: null,
              petFriendly: null,
            });
          },
        },
      ]
    );
  };

  const toggleArrayFilter = (array: string[], value: string, setter: (newArray: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter(item => item !== value));
    } else {
      setter([...array, value]);
    }
  };

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.filterSection}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {children}
    </View>
  );

  const MultiSelectChips = ({ 
    options, 
    selectedValues, 
    onToggle 
  }: { 
    options: string[]; 
    selectedValues: string[]; 
    onToggle: (value: string) => void;
  }) => (
    <View style={styles.chipsContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.chip,
            {
              backgroundColor: selectedValues.includes(option) ? colors.primary : colors.surface,
              borderColor: selectedValues.includes(option) ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onToggle(option)}
        >
          <ThemedText
            style={[
              styles.chipText,
              { color: selectedValues.includes(option) ? '#fff' : colors.text },
            ]}
          >
            {option}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>Advanced Search</ThemedText>
          
          <TouchableOpacity onPress={handleReset} style={styles.headerButton}>
            <ThemedText style={[styles.resetText, { color: colors.primary }]}>Reset</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Price Range */}
          <FilterSection title="Price Range">
            <View style={styles.priceInputContainer}>
              <View style={styles.priceInput}>
                <ThemedText variant="secondary">Min (R)</ThemedText>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border,
                    color: colors.text 
                  }]}
                  value={filters.priceRange.min.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 0;
                    updateFilters({ priceRange: { ...filters.priceRange, min: value } });
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              
              <View style={styles.priceInput}>
                <ThemedText variant="secondary">Max (R)</ThemedText>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border,
                    color: colors.text 
                  }]}
                  value={filters.priceRange.max.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 20000;
                    updateFilters({ priceRange: { ...filters.priceRange, max: value } });
                  }}
                  keyboardType="numeric"
                  placeholder="20000"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
          </FilterSection>

          {/* Property Types */}
          <FilterSection title="Property Types">
            <MultiSelectChips
              options={PROPERTY_TYPES}
              selectedValues={filters.propertyTypes}
              onToggle={(value) => toggleArrayFilter(filters.propertyTypes, value, (newArray) => 
                updateFilters({ propertyTypes: newArray })
              )}
            />
          </FilterSection>

          {/* Room Types */}
          <FilterSection title="Room Types">
            <MultiSelectChips
              options={ROOM_TYPES}
              selectedValues={filters.roomTypes}
              onToggle={(value) => toggleArrayFilter(filters.roomTypes, value, (newArray) => 
                updateFilters({ roomTypes: newArray })
              )}
            />
          </FilterSection>

          {/* Locations */}
          <FilterSection title="Locations">
            <MultiSelectChips
              options={LOCATIONS}
              selectedValues={filters.locations}
              onToggle={(value) => toggleArrayFilter(filters.locations, value, (newArray) => 
                updateFilters({ locations: newArray })
              )}
            />
          </FilterSection>

          {/* Universities */}
          <FilterSection title="Universities">
            <MultiSelectChips
              options={UNIVERSITIES}
              selectedValues={filters.universities}
              onToggle={(value) => toggleArrayFilter(filters.universities, value, (newArray) => 
                updateFilters({ universities: newArray })
              )}
            />
          </FilterSection>

          {/* Amenities */}
          <FilterSection title="Amenities">
            <MultiSelectChips
              options={AMENITIES}
              selectedValues={filters.amenities}
              onToggle={(value) => toggleArrayFilter(filters.amenities, value, (newArray) => 
                updateFilters({ amenities: newArray })
              )}
            />
          </FilterSection>

          {/* Availability */}
          <FilterSection title="Availability">
            <View style={styles.radioGroup}>
              {[
                { value: 'any', label: 'Any' },
                { value: 'available', label: 'Available Now' },
                { value: 'soon', label: 'Available Soon' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioItem}
                  onPress={() => updateFilters({ availability: option.value as any })}
                >
                  <View style={[
                    styles.radio,
                    { borderColor: colors.border },
                    filters.availability === option.value && { backgroundColor: colors.primary }
                  ]}>
                    {filters.availability === option.value && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <ThemedText style={styles.radioLabel}>{option.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </FilterSection>

          {/* Furnished */}
          <FilterSection title="Furnished">
            <View style={styles.radioGroup}>
              {[
                { value: 'any', label: 'Any' },
                { value: 'furnished', label: 'Furnished' },
                { value: 'unfurnished', label: 'Unfurnished' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.radioItem}
                  onPress={() => updateFilters({ furnished: option.value as any })}
                >
                  <View style={[
                    styles.radio,
                    { borderColor: colors.border },
                    filters.furnished === option.value && { backgroundColor: colors.primary }
                  ]}>
                    {filters.furnished === option.value && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <ThemedText style={styles.radioLabel}>{option.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </FilterSection>

          {/* Additional Options */}
          <FilterSection title="Additional Options">
            <View style={styles.switchContainer}>
              <View style={styles.switchItem}>
                <ThemedText>Parking Required</ThemedText>
                <Switch
                  value={filters.parking === true}
                  onValueChange={(value) => updateFilters({ parking: value ? true : null })}
                  trackColor={{ false: colors.surface, true: colors.primary }}
                  thumbColor={colors.background}
                />
              </View>
              
              <View style={styles.switchItem}>
                <ThemedText>Pet Friendly</ThemedText>
                <Switch
                  value={filters.petFriendly === true}
                  onValueChange={(value) => updateFilters({ petFriendly: value ? true : null })}
                  trackColor={{ false: colors.surface, true: colors.primary }}
                  thumbColor={colors.background}
                />
              </View>
            </View>
          </FilterSection>

          <View style={{ height: insets.bottom + 100 }} />
        </ScrollView>

        {/* Apply Button */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
            onPress={handleApply}
          >
            <ThemedText style={styles.applyButtonText}>Apply Filters</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 4,
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  priceInputContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  priceInput: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginTop: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  radioGroup: {
    gap: 12,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioLabel: {
    fontSize: 16,
  },
  switchContainer: {
    gap: 16,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  applyButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});