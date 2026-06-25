import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <View style={styles.wrap}>
      <View style={styles.divider} />
      <View style={styles.brandRow}>
        <View style={styles.pokeball}>
          <View style={styles.pokeballTop} />
          <View style={styles.pokeballBand} />
          <View style={styles.pokeballCenter} />
        </View>
        <Text style={styles.brand}>PokéStore</Text>
      </View>

      <View style={styles.iconRow}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => Linking.openURL('mailto:contact@pokestore.dev')}
          accessibilityLabel="Contact email"
        >
          <MaterialCommunityIcons name="email-outline" size={18} color={colors.text} />
        </Pressable>
        <Pressable
          style={styles.iconBtn}
          onPress={() => Linking.openURL('https://github.com/AdlenSouci/pokestore')}
          accessibilityLabel="GitHub PokéStore"
        >
          <MaterialCommunityIcons name="github" size={18} color={colors.text} />
        </Pressable>
        <Pressable
          style={styles.iconBtn}
          onPress={() => Linking.openURL('https://pokestore-hazel.vercel.app')}
          accessibilityLabel="Site web PokéStore"
        >
          <MaterialCommunityIcons name="web" size={18} color={colors.text} />
        </Pressable>
      </View>

      <Text style={styles.copyright}>
        © {year} PokéStore · Projet Ynov B3 DEV
      </Text>
      <Text style={styles.legal}>
        Pokémon™ © Nintendo / Game Freak — à but pédagogique
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 'auto',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    alignItems: 'center',
    gap: 6,
  },
  divider: {
    height: 2,
    width: '60%',
    backgroundColor: colors.border,
    opacity: 0.4,
    marginBottom: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  pokeball: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1a1a2e',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  pokeballTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#ef4444',
  },
  pokeballBand: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1a1a2e',
  },
  pokeballCenter: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#1a1a2e',
    backgroundColor: '#fff',
  },
  brand: {
    fontFamily: font.pixel,
    fontSize: 14,
    color: colors.text,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.bg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyright: {
    fontFamily: font.sansBold,
    fontSize: 11,
    color: colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
  legal: {
    fontFamily: font.sans,
    fontSize: 9,
    color: colors.text,
    opacity: 0.5,
    textAlign: 'center',
  },
});
