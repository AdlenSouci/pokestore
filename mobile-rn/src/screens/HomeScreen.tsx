import { useEffect, useRef, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Animated, Easing, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppShell } from '../components/AppShell';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

/** Positions fixes (comme le web avec seed) pour éviter le flicker du Math.random. */
const STAR_SEED = Array.from({ length: 50 }, (_, i) => ({
  top: `${((i * 17) % 92) + 4}%`,
  left: `${((i * 31) % 92) + 4}%`,
}));

export function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const scale = Math.min(Math.max(width / 390, 0.85), 1.35);
  const bounce = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const twinkle = useRef(new Animated.Value(0)).current;
  const [showPress, setShowPress] = useState(true);

  const titleMainSize = Math.round(22 * scale);
  const titleSubSize = Math.round(17 * scale);
  const startBtnTextSize = Math.round(14 * scale);
  const pressTextSize = Math.round(11 * scale);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bounce]);

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    spinLoop.start();
    return () => spinLoop.stop();
  }, [spin]);

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

  const translateY = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const starOpacity = twinkle.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  });

  return (
    <AppShell>
      <View style={styles.hero}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: starOpacity }]} pointerEvents="none">
          {STAR_SEED.map((s, i) => (
            <View
              key={i}
              style={[styles.star, { top: s.top as `${number}%`, left: s.left as `${number}%` }]}
            />
          ))}
        </Animated.View>

        <View style={styles.center}>
          <Animated.View style={{ transform: [{ translateY }] }}>
            <Text
              style={[
                styles.titleMain,
                {
                  fontSize: titleMainSize,
                  lineHeight: titleMainSize * 1.45,
                },
              ]}
            >
              POKÉSTORE
            </Text>
            <Text
              style={[
                styles.titleSub,
                {
                  fontSize: titleSubSize,
                  lineHeight: titleSubSize * 1.5,
                  marginTop: 10,
                },
              ]}
            >
              Cartes Pokémon TCG
            </Text>
          </Animated.View>

          <Animated.View style={[styles.ballOuter, { transform: [{ rotate }] }]}>
            <LinearGradient
              colors={['#ef4444', '#b91c1c', '#991b1b']}
              style={styles.ballTop}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
            <LinearGradient
              colors={['#f9fafb', '#e5e7eb', '#d1d5db']}
              style={styles.ballBottom}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />
            <View style={styles.ballBand} />
            <View style={styles.ballCenter}>
              <View style={styles.ballInner} />
            </View>
          </Animated.View>

          <Pressable
            style={({ pressed }) => [styles.startBtn, pressed && { transform: [{ scale: 0.96 }] }]}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={[styles.startText, { fontSize: startBtnTextSize }]}>Voir la boutique</Text>
          </Pressable>

          <View style={styles.pressRow}>
            {showPress ? (
              <Text style={[styles.pressStart, { fontSize: pressTextSize }]}>Touche pour commencer</Text>
            ) : (
              <Text style={styles.pressStartHidden}> </Text>
            )}
          </View>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 1,
    minHeight: 400,
    position: 'relative',
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 2,
  },
  titleMain: {
    fontFamily: font.pixel,
    color: colors.mint,
    textAlign: 'center',
    textShadowColor: colors.border,
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  titleSub: {
    fontFamily: font.pixel,
    color: colors.text,
    textAlign: 'center',
    textShadowColor: colors.border,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  ballOuter: {
    width: 128,
    height: 128,
    marginVertical: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: 64,
    borderTopRightRadius: 64,
    borderWidth: 8,
    borderColor: colors.border,
    borderBottomWidth: 0,
  },
  ballBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderBottomLeftRadius: 64,
    borderBottomRightRadius: 64,
    borderWidth: 8,
    borderColor: colors.border,
    borderTopWidth: 0,
  },
  ballBand: {
    position: 'absolute',
    top: '50%',
    marginTop: -4,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: colors.border,
    zIndex: 2,
  },
  ballCenter: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.text,
    borderWidth: 8,
    borderColor: colors.border,
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ballInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d1d5db',
  },
  startBtn: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    backgroundColor: colors.mint,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: colors.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  startText: {
    fontFamily: font.pixel,
    color: colors.inputText,
    fontWeight: '700',
  },
  pressRow: {
    minHeight: 36,
    justifyContent: 'center',
  },
  pressStart: {
    fontFamily: font.pixel,
    color: colors.text,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  pressStartHidden: {
    fontSize: 11,
    opacity: 0,
  },
});
