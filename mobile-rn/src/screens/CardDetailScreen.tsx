import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TypeEffectWebView } from '../components/effects/TypeEffectWebView';
import { TiltableCard } from '../components/TiltableCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { categoryToEffectType } from '../lib/cardTypeToEffect';
import * as cartService from '../services/cart';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'CardDetail'>;

export function CardDetailScreen({ route }: Props) {
  const { product } = route.params;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, refreshCart } = useAuth();
  const { showSuccess, showError } = useToast();
  const effectType = categoryToEffectType(product.category);
  const [fxBox, setFxBox] = useState({ w: 0, h: 0 });

  const onAddToCart = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    try {
      const cardId = parseInt(product.id, 10);
      await cartService.addToCart(cardId, 1);
      await refreshCart();
      showSuccess(`${product.name} ajouté au panier`);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Impossible d’ajouter au panier');
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} style={styles.scroll}>
        <View
          style={styles.cardFxWrap}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setFxBox((prev) =>
              prev.w === width && prev.h === height ? prev : { w: width, h: height },
            );
          }}
        >
          {effectType != null && fxBox.w > 0 && fxBox.h > 0 && (
            <View style={styles.fxLayer} pointerEvents="none">
              <TypeEffectWebView type={effectType} width={fxBox.w} height={fxBox.h} />
            </View>
          )}
          <TiltableCard style={styles.tiltWrap}>
            <View style={styles.imageWrap}>
              <Image source={{ uri: product.image }} style={styles.image} contentFit="contain" />
            </View>
          </TiltableCard>
        </View>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.desc}>{product.description}</Text>
        <Text style={styles.price}>
          {Number.isFinite(product.price) ? `${product.price.toFixed(2)} €` : '—'}
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{product.category}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Rareté</Text>
          <Text style={styles.value}>{product.rarity}</Text>
        </View>
        {product.tcgSetName != null && (
          <View style={styles.row}>
            <Text style={styles.label}>Set</Text>
            <Text style={styles.value}>{product.tcgSetName}</Text>
          </View>
        )}
        {product.series != null && (
          <View style={styles.row}>
            <Text style={styles.label}>Série</Text>
            <Text style={styles.value}>{product.series}</Text>
          </View>
        )}
        {product.releaseYear != null && (
          <View style={styles.row}>
            <Text style={styles.label}>Année</Text>
            <Text style={styles.value}>{String(product.releaseYear)}</Text>
          </View>
        )}

        <Pressable onPress={onAddToCart} style={styles.btnOuter}>
          <LinearGradient
            colors={['#5a4f99', '#2d3561']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGrad}
          >
            <MaterialCommunityIcons name="cart-plus" size={22} color={colors.text} />
            <Text style={styles.btnText}>Ajouter au panier</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  cardFxWrap: {
    position: 'relative',
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  fxLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    elevation: 0,
  },
  tiltWrap: {
    width: '100%',
    maxWidth: 340,
    zIndex: 1,
    elevation: 6,
  },
  imageWrap: {
    backgroundColor: '#1a2038',
    borderRadius: 24,
    padding: 10,
    borderWidth: 8,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 63 / 88,
    borderRadius: 16,
    backgroundColor: '#1a2038',
  },
  name: {
    fontFamily: font.pixel,
    fontSize: 12,
    lineHeight: 20,
    color: colors.text,
    marginBottom: 8,
  },
  desc: {
    fontFamily: font.sans,
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  price: {
    fontFamily: font.sansBold,
    fontSize: 26,
    color: colors.mint,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  label: {
    fontFamily: font.sansMedium,
    color: colors.indigoText,
    fontSize: 15,
  },
  value: {
    fontFamily: font.sansMedium,
    color: colors.text,
    fontSize: 15,
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  btnOuter: {
    marginTop: 28,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
  },
  btnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  btnText: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 16,
  },
});
