import { useEffect, useRef, useState } from 'react';
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
  const [showPress, setShowPress] = useState(true);

  const titleSize = Math.round(20 * scale);
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

  useEffect(() => {
    const id = setInterval(() => setShowPress((p) => !p), 800);
    return () => clearInterval(id);
  }, []);

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

          <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize * 1.5 }]}>
            PokéStore
          </Text>

          <Text style={[styles.subtitle, { fontSize: subSize + 1 }]}>
            Catalogue, filtres et paiement sécurisé
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

          {showPress ? (
            <Text style={[styles.pressHint, { fontSize: subSize - 1 }]}>Touche pour commencer</Text>
          ) : (
            <Text style={styles.pressHidden}> </Text>
          )}

          <View style={styles.features}>
            {[
              { emoji: '🃏', label: 'Catalogue filtré' },
              { emoji: '💳', label: 'Paiement Stripe' },
              { emoji: '📦', label: 'Ma collection' },
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
  title: {
    fontFamily: font.pixel,
    color: colors.text,
    textAlign: 'center',
    textShadowColor: colors.bgDeep,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
    marginBottom: 8,
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
    marginBottom: 12,
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
  pressHint: {
    fontFamily: font.pixel,
    color: colors.text,
    opacity: 0.8,
    marginBottom: 24,
  },
  pressHidden: {
    fontSize: 11,
    opacity: 0,
    marginBottom: 24,
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
