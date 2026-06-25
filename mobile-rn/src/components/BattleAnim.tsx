import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

const dracImg = require('../../assets/drac.png');
const tortankImg = require('../../assets/tortank.png');

interface BattleAnimProps {
  size?: 'nav' | 'hero';
}

export function BattleAnim({ size = 'hero' }: BattleAnimProps) {
  const isHero = size === 'hero';
  const sprite = isHero ? 72 : 34;
  const gap = isHero ? 12 : 2;

  const dracY = useRef(new Animated.Value(0)).current;
  const tortankY = useRef(new Animated.Value(0)).current;
  const dracX = useRef(new Animated.Value(0)).current;
  const tortankX = useRef(new Animated.Value(0)).current;
  const flame = useRef(new Animated.Value(0)).current;
  const water = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bob = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: -3, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      );

    const attackRight = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 6, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.delay(2200),
        ]),
      );

    const attackLeft = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: -6, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.delay(2200),
        ]),
      );

    const effect = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.delay(2400),
        ]),
      );

    const a1 = bob(dracY, 0);
    const a2 = bob(tortankY, 300);
    const a3 = attackRight(dracX, 0);
    const a4 = attackLeft(tortankX, 1800);
    const a5 = effect(flame, 0);
    const a6 = effect(water, 1800);
    a1.start(); a2.start(); a3.start(); a4.start(); a5.start(); a6.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); a4.stop(); a5.stop(); a6.stop(); };
  }, [dracY, tortankY, dracX, tortankX, flame, water]);

  return (
    <View style={[styles.arena, isHero ? styles.arenaHero : styles.arenaNav]} accessibilityElementsHidden>
      <View style={styles.grass} />

      <Animated.View
        style={[
          styles.spriteWrap,
          { marginRight: gap, transform: [{ translateY: dracY }, { translateX: dracX }] },
        ]}
      >
        <Image
          source={dracImg}
          style={[styles.sprite, { width: sprite, height: sprite, transform: [{ scaleX: -1 }] }]}
          resizeMode="contain"
        />
        <Animated.Text style={[styles.effect, isHero ? styles.effectHero : styles.effectNav, { opacity: flame }]}>
          🔥
        </Animated.Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.spriteWrap,
          { marginLeft: gap, transform: [{ translateY: tortankY }, { translateX: tortankX }] },
        ]}
      >
        <Image
          source={tortankImg}
          style={[styles.sprite, { width: sprite, height: sprite }]}
          resizeMode="contain"
        />
        <Animated.Text style={[styles.effect, styles.effectLeft, isHero ? styles.effectHero : styles.effectNav, { opacity: water }]}>
          💧
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  arena: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  arenaHero: {
    height: 100,
    width: '100%',
    maxWidth: 320,
  },
  arenaNav: {
    height: 40,
    width: 110,
  },
  grass: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: 'rgba(22, 101, 52, 0.35)',
  },
  spriteWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sprite: {
    // pixel art net
  },
  effect: {
    position: 'absolute',
    top: 4,
  },
  effectHero: {
    fontSize: 18,
    right: -6,
  },
  effectNav: {
    fontSize: 10,
    right: -4,
  },
  effectLeft: {
    right: undefined,
    left: -6,
  },
});
