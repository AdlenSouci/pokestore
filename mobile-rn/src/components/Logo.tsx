import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { font } from '../theme/typography';
import { colors } from '../theme/colors';

const logoSource = require('../../assets/logo.png');

/** Ratio du logo préparé (655×908) */
const LOGO_ASPECT = 655 / 908;

const HEIGHTS = {
  nav: 48,
  sm: 72,
  md: 96,
  lg: 120,
  hero: 180,
} as const;

const RADIUS = {
  nav: 10,
  sm: 12,
  md: 14,
  lg: 16,
  hero: 20,
} as const;

export type LogoSize = keyof typeof HEIGHTS;

export type LogoProps = {
  size?: LogoSize;
  showText?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Logo({
  size = 'md',
  showText = false,
  style,
  onPress,
  accessibilityLabel = 'PokéStore',
}: LogoProps) {
  const height = HEIGHTS[size];
  const radius = RADIUS[size];
  const width = Math.round(height * LOGO_ASPECT);

  const badge = (
    <Image
      source={logoSource}
      style={{ width, height, borderRadius: radius }}
      contentFit="cover"
      accessibilityIgnoresInvertColors
    />
  );

  const content = (
    <>
      {badge}
      {showText && (
        <Text style={styles.text} numberOfLines={1}>
          PokéStore
        </Text>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, style, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.row, style]} accessibilityLabel={accessibilityLabel}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.92,
  },
  text: {
    fontFamily: font.pixel,
    fontSize: 11,
    color: colors.text,
    letterSpacing: -0.5,
  },
});
