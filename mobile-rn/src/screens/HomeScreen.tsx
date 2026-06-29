import { useEffect, useRef } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppShell } from '../components/AppShell';
import { BattleAnim } from '../components/BattleAnim';
import { Logo } from '../components/Logo';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const STAR_SEED = Array.from({ length: 30 }, (_, i) => ({
  top: `${((i * 17) % 92) + 4}%`,
  left: `${((i * 31) % 92) + 4}%`,
}));

export function HomeScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const scale = Math.min(Math.max(width / 390, 0.85), 1.25);
  const twinkle = useRef(new Animated.Value(0)).current;

  const subSize = Math.round(12 * scale);
  const btnSize = Math.round(13 * scale);

  useEffect(() => {
    const tw = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ]),
    );
    tw.start();
    return () => tw.stop();
  }, [twinkle]);

  const starOpacity = twinkle.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <AppShell hideFooter>
      <ScrollView
        contentContainerStyle={[styles.scroll, { minHeight: height - 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <LinearGradient
            colors={['#1a1f3a', '#2d3561', '#1a1f3a']}
            style={StyleSheet.absoluteFill}
          />

          <Animated.View style={[StyleSheet.absoluteFill, { opacity: starOpacity }]} pointerEvents="none">
            {STAR_SEED.map((s, i) => (
              <View
                key={i}
                style={[styles.star, { top: s.top as `${number}%`, left: s.left as `${number}%` }]}
              />
            ))}
          </Animated.View>

          <Text style={[styles.tag, { fontSize: subSize }]}>Boutique de cartes Pokémon</Text>

          <Logo size="hero" style={styles.logoHero} />

          <Text style={[styles.subtitle, { fontSize: subSize + 1 }]}>
            Parcourez le catalogue Pokémon TCG, filtrez par prix, série et extension, puis ajoutez
            vos cartes au panier.
          </Text>

          <View style={styles.battleWrap}>
            <BattleAnim size="hero" />
          </View>

          <Pressable
            style={({ pressed }) => [styles.startBtn, pressed && { transform: [{ scale: 0.97 }] }]}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={[styles.startText, { fontSize: btnSize }]}>Voir la boutique</Text>
          </Pressable>

          <View style={styles.features}>
            {[
              { emoji: '🃏', label: 'Filtres' },
              { emoji: '🛒', label: 'Panier' },
              { emoji: '📦', label: 'Mes commandes' },
            ].map((f) => (
              <View key={f.label} style={styles.featureChip}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
    overflow: 'hidden',
    position: 'relative',
  },
  star: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  tag: {
    fontFamily: font.sansBold,
    color: colors.mint,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  logoHero: {
    marginBottom: 12,
    alignSelf: 'center',
  },
  subtitle: {
    fontFamily: font.sans,
    color: colors.indigoText,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  battleWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  startBtn: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: colors.mint,
    borderRadius: 14,
    borderWidth: 4,
    borderColor: colors.border,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  startText: {
    fontFamily: font.pixel,
    color: colors.inputText,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(90, 79, 153, 0.5)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  featureEmoji: {
    fontSize: 14,
  },
  featureLabel: {
    fontFamily: font.sansBold,
    fontSize: 11,
    color: colors.indigoText,
  },
});
