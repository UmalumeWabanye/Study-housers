# Theme System Guidelines

## Overview

This document outlines the comprehensive theme system implemented for automatic adaptation to iOS system light/dark mode. All screens and components should follow these guidelines to ensure consistent theming across the entire application.

## Theme Architecture

### 1. Enhanced Theme Configuration (`constants/theme.ts`)

The theme system provides an extensive color palette that automatically adapts to system preferences:

```typescript
// Access theme colors
import { Colors } from '@/constants/theme';
const lightColors = Colors.light;
const darkColors = Colors.dark;
```

### 2. Core Theme Hook (`hooks/use-theme.ts`)

Use the main theme hook for accessing colors and theme state:

```typescript
import { useTheme } from '@/hooks/use-theme';

function MyComponent() {
  const { colors, colorScheme, isDark, isLight } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello World</Text>
    </View>
  );
}
```

### 3. Enhanced Themed Components (`components/themed-components.tsx`)

Use the enhanced themed components for automatic theme adaptation:

#### ThemedView
```typescript
import { ThemedView } from '@/components/themed-components';

// Basic usage
<ThemedView style={styles.container} />

// With variants
<ThemedView variant="card" />      // Automatic card styling with shadows
<ThemedView variant="surface" />   // Surface color with elevation
```

#### ThemedText
```typescript
import { ThemedText } from '@/components/themed-components';

<ThemedText variant="title">Page Title</ThemedText>
<ThemedText variant="subtitle">Section Header</ThemedText>
<ThemedText variant="secondary">Muted text</ThemedText>
<ThemedText variant="error">Error message</ThemedText>
```

#### ThemedButton
```typescript
import { ThemedButton } from '@/components/themed-components';

<ThemedButton 
  variant="primary" 
  size="large" 
  title="Submit"
  onPress={handleSubmit}
/>
```

#### ThemedTextInput
```typescript
import { ThemedTextInput } from '@/components/themed-components';

<ThemedTextInput 
  variant="outlined"
  placeholder="Enter text"
  value={value}
  onChangeText={setValue}
/>
```

## Color Palette Reference

### Primary Colors
- `colors.primary` - Main brand color (#ff5a5f)
- `colors.secondary` - Secondary UI elements
- `colors.background` - Main background
- `colors.surface` - Elevated surfaces
- `colors.text` - Primary text

### UI State Colors
- `colors.error` - Error states
- `colors.success` - Success states  
- `colors.warning` - Warning states
- `colors.info` - Info states

### Text Variants
- `colors.text` - Primary text
- `colors.textSecondary` - Secondary text
- `colors.textTertiary` - Tertiary/muted text
- `colors.textDisabled` - Disabled text

### Input Colors
- `colors.inputBackground` - Input field background
- `colors.inputBorder` - Input field borders
- `colors.inputPlaceholder` - Placeholder text

### Card/Surface Colors
- `colors.cardBackground` - Card backgrounds
- `colors.cardBorder` - Card borders
- `colors.surface` - General surface color
- `colors.surfaceVariant` - Variant surface color

## Implementation Guidelines

### For New Screens

1. **Always use themed components**:
   ```typescript
   import { ThemedView, ThemedText } from '@/components/themed-components';
   import { useTheme } from '@/hooks/use-theme';
   ```

2. **Structure your component**:
   ```typescript
   export default function MyScreen() {
     const { colors } = useTheme();
     const insets = useSafeAreaInsets();
   
     return (
       <ThemedView style={styles.container}>
         <StatusBar style="auto" />
         {/* Content */}
       </ThemedView>
     );
   }
   ```

3. **Use dynamic colors in styles**:
   ```typescript
   // DO: Use theme colors dynamically
   <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
   
   // DON'T: Use hardcoded colors
   <View style={{ backgroundColor: '#ffffff' }}>
   ```

### For Icons and Images

Always use theme-aware colors for icons:
```typescript
const { colors } = useTheme();

<Ionicons 
  name="home" 
  size={24} 
  color={colors.icon} 
/>
```

### For Custom Components

When creating custom components, always support theming:

```typescript
interface MyComponentProps {
  variant?: 'default' | 'highlighted';
}

export function MyComponent({ variant = 'default' }: MyComponentProps) {
  const { colors } = useTheme();
  
  const backgroundColor = variant === 'highlighted' 
    ? colors.primary 
    : colors.surface;
    
  return (
    <ThemedView style={{ backgroundColor }}>
      <ThemedText>Content</ThemedText>
    </ThemedView>
  );
}
```

## Testing Theme Transitions

To test theme adaptation:

1. **iOS Device/Simulator**:
   - Settings > Display & Brightness
   - Switch between Light and Dark mode
   - App should immediately adapt

2. **Development**:
   - Use Expo's development tools
   - Toggle theme in device settings
   - Verify smooth transitions

## Best Practices

### DO:
✅ Use the enhanced themed components  
✅ Access colors through `useTheme()` hook  
✅ Apply dynamic colors in component logic  
✅ Test both light and dark modes  
✅ Use semantic color names (primary, surface, etc.)  

### DON'T:
❌ Use hardcoded hex colors in styles  
❌ Assume light mode as default  
❌ Mix old and new theming approaches  
❌ Forget to test theme transitions  
❌ Use colors that don't adapt to theme  

## Migration from Legacy Components

If migrating existing screens:

1. Replace imports:
   ```typescript
   // Old
   import { ThemedText } from '@/components/themed-text';
   import { ThemedView } from '@/components/themed-view';
   
   // New
   import { ThemedText, ThemedView } from '@/components/themed-components';
   ```

2. Update props:
   ```typescript
   // Old
   <ThemedText type="title">Title</ThemedText>
   
   // New
   <ThemedText variant="title">Title</ThemedText>
   ```

3. Replace color hooks:
   ```typescript
   // Old
   const backgroundColor = useThemeColor({}, 'background');
   
   // New
   const { colors } = useTheme();
   // Use colors.background directly
   ```

## Future Considerations

- All new screens MUST use this enhanced theme system
- Consider adding more semantic color tokens as needed
- Maintain backward compatibility where possible
- Document any theme system extensions
- Test theme switching across all new features

This system ensures that your app will automatically and seamlessly adapt to user's system theme preferences, providing an optimal user experience that feels native to iOS.