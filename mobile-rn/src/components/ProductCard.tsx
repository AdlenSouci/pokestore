import { useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import * as cartService from '../services/cart';
import type { RootStackParamList } from '../types/navigation';
import type { Product } from '../types/product';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

const IMG_MAX = 280;

function imageMaxWidth(columnWidth?: number) {
  if (columnWidth == null) {
    return IMG_MAX;
  }
  return Math.min(columnWidth - 4, IMG_MAX);
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Props = {
  product: Product;
  columnWidth?: number;
};

/**
 * Web : effets au **survol** (3D, shine, rainbow, « VIEW CARD »).
 * Mobile : au **maintien du doigt** — zoom + overlay + bande lumineuse (équivalent tactile).
 */
export function ProductCard({ product, columnWidth }: Props) {
  const navigation = useNavigation<Nav>();
  const { user, refreshCart } = useAuth();
  const scale = useRef(new Animated.Value(1)).current;
  const overlay = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;

  const imgMax = imageMaxWidth(columnWidth);

  const onView = () => {
    navigation.navigate('CardDetail', { product });
  };

  const onAddToCart = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    try {
      const cardId = parseInt(product.id, 10);
      await cartService.addToCart(cardId, 1);
      await refreshCart();
      Alert.alert('Panier', `${product.name} a été ajouté au panier.`);
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Impossible d’ajouter au panier');
    }
  };

  const pressIn = () => {
    sweep.setValue(0);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1.06,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(overlay, {
        toValue: 1,
        duration: 160,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sweep, {
        toValue: 1,
        duration: 550,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const pressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(overlay, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sweep, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const shineTranslate = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-140, 140],
  });

  return (
    <View style={[styles.wrap, columnWidth != null && { width: '100%' }]}>
      <Pressable
        onPress={onView}
        onPressIn={pressIn}
        onPressOut={pressOut}
        android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
      >
        <Animated.View
          style={[
            styles.imageFrame,
            { maxWidth: imgMax },
            { transform: [{ scale }] },
          ]}
        >
          <Image source={{ uri: product.image }} style={styles.image} contentFit="contain" />

          <Animated.View
            style={[
              styles.shineStrip,
              {
                opacity: overlay,
                transform: [{ translateX: shineTranslate }, { rotateZ: '25deg' }],
              },
            ]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.85)', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          <Animated.View style={[styles.hoverOverlay, { opacity: overlay }]} pointerEvents="none">
            <LinearGradient
              colors={['rgba(90,79,153,0.4)', 'rgba(126,200,163,0.3)', 'rgba(139,126,200,0.4)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.viewPill}>
              <MaterialCommunityIcons name="eye" size={22} color={colors.text} />
              <Text style={styles.viewPillText}>VIEW CARD</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Pressable>

      <View style={[styles.meta, { maxWidth: imgMax }]}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.sub}>
          {product.category} — {product.rarity}
        </Text>
        <Text style={styles.price}>
          {Number.isFinite(product.price) ? `${product.price.toFixed(2)} €` : '—'}
        </Text>

        <Pressable
          onPress={onAddToCart}
          style={({ pressed }) => [styles.btnOuter, pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] }]}
        >
          <LinearGradient
            colors={['#5a4f99', '#2d3561']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGrad}
          >
            <MaterialCommunityIcons name="cart-plus" size={20} color={colors.text} />
            <Text style={styles.btnText}>Ajouter au panier</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 24,
    maxWidth: 360,
    alignSelf: 'center',
    width: '100%',
  },
  imageFrame: {
    width: '100%',
    aspectRatio: 63 / 88,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  shineStrip: {
    position: 'absolute',
    top: '-20%',
    bottom: '-20%',
    width: '45%',
    left: '27.5%',
  },
  hoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.mint,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: colors.text,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  viewPillText: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 15,
  },
  meta: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  name: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  sub: {
    fontFamily: font.sansMedium,
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  price: {
    fontFamily: font.sansBold,
    fontSize: 24,
    color: colors.mint,
    marginBottom: 12,
  },
  btnOuter: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  btnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  btnText: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 15,
  },
});
