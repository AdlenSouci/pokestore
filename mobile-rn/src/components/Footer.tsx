import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { RootStackParamList } from '../types/navigation';
import { Logo } from './Logo';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function Footer() {
  const navigation = useNavigation<Nav>();
  const year = new Date().getFullYear();

  return (
    <View style={styles.wrap}>
      <View style={styles.divider} />
      <View style={styles.brandRow}>
        <Logo size="sm" />
        <Text style={styles.tagline}>Boutique de cartes Pokémon TCG.</Text>
      </View>

      <View style={styles.iconRow}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => navigation.navigate('Contact')}
          accessibilityLabel="Formulaire de contact"
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
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  tagline: {
    fontFamily: font.sans,
    fontSize: 11,
    color: colors.indigoText,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 260,
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
