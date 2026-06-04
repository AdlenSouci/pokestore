import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

export function Footer() {
  return (
    <View style={styles.row}>
      <View style={styles.badge}>
        <Text style={styles.pixel}>VERSION GBA</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.pixel}>© 2025</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 'auto',
    paddingVertical: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    zIndex: 10,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.bg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.mint,
  },
  pixel: {
    fontFamily: font.pixel,
    fontSize: 10,
    color: colors.text,
    opacity: 0.95,
  },
});
