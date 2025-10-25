/**
 * Theme hook - Re-exports from ThemeContext for backward compatibility
 * Use the ThemeContext for full theme management capabilities
 */

// Re-export the theme hooks from context
export { useTheme, useThemedStyles } from '@/context/ThemeContext';

// Keep backward compatibility with Colors export
export { Colors } from '@/constants/theme';
