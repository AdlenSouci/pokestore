import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { EffectType } from '../../lib/cardTypeToEffect';

/**
 * Effets par type en pur React Native (pas de WebView / canvas) — fiable sur iOS + Android.
 * Inspiré visuellement du site (eau, feu, électricité, psy, vol, dragon).
 */
export function TypeEffectNative({ type }: { type: EffectType }) {
  const { width, height } = useWindowDimensions();
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(t, {
        toValue: 1,
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => {
      loop.stop();
      t.setValue(0);
    };
  }, [t]);

  const pulse = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 0.35, 0.15] });
  const shift = t.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const spin = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const common = [StyleSheet.absoluteFillObject, { width, height }];

  switch (type) {
    case 'water':
      return (
        <View style={styles.layer} pointerEvents="none">
          <Animated.View style={[common, { opacity: pulse }]}>
            <LinearGradient colors={['rgba(30,80,180,0.5)', 'rgba(50,150,255,0.25)', 'transparent']} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View
            style={[
              common,
              {
                opacity: 0.35,
                transform: [{ translateY: shift.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) }],
              },
            ]}
          >
            <LinearGradient colors={['transparent', 'rgba(120,200,255,0.4)', 'transparent']} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View style={[common, { opacity: pulse }]}>
            <LinearGradient colors={['rgba(0,40,120,0.35)', 'transparent', 'rgba(80,160,240,0.2)']} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>
      );
    case 'fire':
      return (
        <View style={styles.layer} pointerEvents="none">
          <Animated.View style={[common, { opacity: pulse }]}>
            <LinearGradient colors={['rgba(180,40,20,0.45)', 'rgba(255,120,40,0.2)', 'transparent']} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View
            style={[
              common,
              {
                opacity: 0.4,
                transform: [{ translateY: shift.interpolate({ inputRange: [0, 1], outputRange: [20, -60] }) }],
              },
            ]}
          >
            <LinearGradient colors={['transparent', 'rgba(255,200,80,0.35)', 'rgba(255,80,30,0.15)']} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>
      );
    case 'electric':
      return (
        <View style={styles.layer} pointerEvents="none">
          <Animated.View style={[common, { opacity: pulse }]}>
            <LinearGradient colors={['rgba(80,70,20,0.4)', 'rgba(255,230,100,0.35)', 'rgba(255,255,200,0.15)']} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View
            style={[
              common,
              {
                opacity: t.interpolate({ inputRange: [0, 0.08, 0.1, 1], outputRange: [0.5, 0.9, 0.25, 0.25] }),
              },
            ]}
          >
            <LinearGradient colors={['rgba(255,255,255,0.25)', 'transparent']} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>
      );
    case 'psy':
      return (
        <View style={styles.layer} pointerEvents="none">
          <Animated.View style={[common, { opacity: pulse }]}>
            <LinearGradient colors={['rgba(100,40,160,0.45)', 'rgba(180,100,255,0.2)', 'transparent']} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              { transform: [{ scale: shift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }) }] },
            ]}
          >
            <LinearGradient colors={['transparent', 'rgba(140,80,200,0.25)', 'transparent']} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>
      );
    case 'flying':
      return (
        <View style={styles.layer} pointerEvents="none">
          <Animated.View style={[common, { opacity: pulse, transform: [{ rotate: spin }] }]}>
            <LinearGradient colors={['rgba(200,230,255,0.35)', 'transparent', 'rgba(220,240,255,0.2)']} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>
      );
    case 'dragon':
      return (
        <View style={styles.layer} pointerEvents="none">
          <Animated.View style={[common, { opacity: pulse }]}>
            <LinearGradient colors={['rgba(200,140,40,0.35)', 'rgba(60,120,220,0.25)', 'transparent']} style={StyleSheet.absoluteFill} />
          </Animated.View>
          <Animated.View style={[common, { opacity: 0.3, transform: [{ rotate: spin }] }]}>
            <LinearGradient colors={['transparent', 'rgba(255,200,100,0.2)', 'transparent']} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});
