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
  quantity?: number;
  collectionMode?: boolean;
};

export function ProductCard({ product, columnWidth, quantity, collectionMode }: Props) {
  const navigation = useNavigation<Nav>();
  const { user, refreshCart } = useAuth();
  const scale = useRef(new Animated.Value(1)).current;
  const sweep = useRef(new Animated.Value(0)).current;

  const imgMax = imageMaxWidth(columnWidth);
  const isCompact = columnWidth != null && columnWidth < 220;

  const inCollection = quantity != null && quantity > 0;

  const onView = () => {
    navigation.navigate('CardDetail', { product });
  };

  const onWallpaper = () => {
    navigation.navigate('WallpaperPreview', { product });
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
        toValue: 1.05,
        friction: 6,
        tension: 120,
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

          {inCollection && (
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyBadgeText}>×{quantity}</Text>
            </View>
          )}

          <Animated.View
            style={[
              styles.shineStrip,
              {
                opacity: sweep,
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
        </Animated.View>
      </Pressable>

      <View style={[styles.meta, { maxWidth: imgMax }]}>
        <Text
          style={[styles.name, isCompact && styles.nameCompact]}
          numberOfLines={2}
        >
          {product.name}
        </Text>
        <Text
          style={[styles.sub, isCompact && styles.subCompact]}
          numberOfLines={1}
        >
          {product.category} — {product.rarity}
        </Text>
        <Text style={[styles.price, isCompact && styles.priceCompact]}>
          {inCollection
            ? `${quantity} en collection`
            : Number.isFinite(product.price)
              ? `${product.price.toFixed(2)} €`
              : '—'}
        </Text>

        <Pressable
          onPress={collectionMode ? onWallpaper : onAddToCart}
          style={({ pressed }) => [
            styles.btnOuter,
            pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] },
          ]}
        >
          <LinearGradient
            colors={collectionMode ? ['#3d8b7a', '#2d5a4f'] : ['#5a4f99', '#2d3561']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.btnGrad, isCompact && styles.btnGradCompact]}
          >
            <MaterialCommunityIcons
              name={collectionMode ? 'image-filter-hdr' : 'cart-plus'}
              size={isCompact ? 16 : 20}
              color={colors.text}
            />
            <Text style={[styles.btnText, isCompact && styles.btnTextCompact]}>
              {collectionMode
                ? isCompact
                  ? 'Fond écran'
                  : 'Fond d’écran IA'
                : isCompact
                  ? 'Ajouter'
                  : 'Ajouter au panier'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 16,
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
  qtyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: colors.mint,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: colors.border,
  },
  qtyBadgeText: {
    fontFamily: font.sansBold,
    fontSize: 11,
    color: colors.inputText,
  },
  shineStrip: {
    position: 'absolute',
    top: '-20%',
    bottom: '-20%',
    width: '45%',
    left: '27.5%',
  },
  meta: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  name: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 4,
    minHeight: 36,
  },
  nameCompact: {
    fontSize: 12,
    minHeight: 30,
    lineHeight: 15,
  },
  sub: {
    fontFamily: font.sansMedium,
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  subCompact: {
    fontSize: 10,
  },
  price: {
    fontFamily: font.sansBold,
    fontSize: 22,
    color: colors.mint,
    marginBottom: 10,
  },
  priceCompact: {
    fontSize: 16,
    marginBottom: 8,
  },
  btnOuter: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  btnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  btnGradCompact: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 4,
  },
  btnText: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 14,
  },
  btnTextCompact: {
    fontSize: 11,
  },
});
