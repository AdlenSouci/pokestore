import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

type Props = {
  message: string;
};

/** Bannière d’erreur inline (formulaires, écrans liste). */
export function InlineErrorBanner({ message }: Props) {
  if (!message) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: 'rgba(255, 85, 85, 0.15)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 85, 85, 0.45)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  text: {
    fontFamily: font.sansMedium,
    color: '#fecaca',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
