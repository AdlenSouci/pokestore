import { useCallback, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppShell } from '../components/AppShell';
import * as wallpaperService from '../services/wallpaper';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'WallpaperPreview'>;

function sourceLabel(source: wallpaperService.WallpaperSource | undefined): string | null {
  if (source === 'gemini') return 'Généré par IA (Gemini)';
  if (source === 'openai') return 'Généré par IA (DALL·E 3)';
  if (source === 'pollinations') return 'Généré par IA (Flux)';
  return null;
}

export function WallpaperPreviewScreen({ route, navigation }: Props) {
  const { product } = route.params;
  const cardId = parseInt(product.id, 10);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<wallpaperService.WallpaperResult | null>(null);

  const generate = useCallback(async () => {
    if (!Number.isFinite(cardId)) {
      setError('Carte invalide');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await wallpaperService.generateWallpaper(cardId);
      setResult(data);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : 'Génération impossible');
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  const writeWallpaperFile = (): File => {
    if (!result?.imageBase64) {
      throw new Error('Aucune image à enregistrer');
    }
    const file = new File(Paths.cache, `pokestore-wallpaper-${cardId}.png`);
    if (file.exists) {
      file.delete();
    }
    file.create({ overwrite: true });
    file.write(result.imageBase64, { encoding: 'base64' });
    return file;
  };

  const saveWallpaper = async () => {
    if (!result?.imageBase64) return;

    setSaving(true);
    try {
      const file = writeWallpaperFile();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'image/png',
          dialogTitle: 'Enregistrer ton fond d’écran',
        });
        return;
      }

      const permission = await MediaLibrary.requestPermissionsAsync(true);
      if (!permission.granted) {
        Alert.alert(
          'Permission requise',
          'Autorise l’accès aux photos pour enregistrer le fond d’écran.',
        );
        return;
      }

      await MediaLibrary.saveToLibraryAsync(file.uri);
      Alert.alert(
        'Enregistré',
        'Le fond d’écran est dans ta galerie. Définis-le depuis Paramètres → Fond d’écran.',
      );
    } catch (e) {
      Alert.alert(
        'Erreur',
        e instanceof Error ? e.message : 'Enregistrement impossible. Réessaie via Partager.',
      );
    } finally {
      setSaving(false);
    }
  };

  const imageUri = result
    ? `data:${result.mimeType};base64,${result.imageBase64}`
    : null;

  return (
    <AppShell>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="image-filter-hdr" size={28} color={colors.mint} />
          <View style={styles.headerText}>
            <Text style={styles.title}>FOND D&apos;ÉCRAN</Text>
            <Text style={styles.subtitle}>{product.name}</Text>
            <Text style={styles.hint}>
              L&apos;IA transforme l&apos;illustration de ta carte en fond d&apos;écran vertical 9:16 — décor étendu, sans bordure ni texte de carte.
            </Text>
          </View>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        {!result && !loading && (
          <View style={styles.placeholder}>
            <Image source={{ uri: product.image }} style={styles.previewCard} contentFit="contain" />
            <Pressable style={styles.primaryBtn} onPress={() => void generate()}>
              <MaterialCommunityIcons name="auto-fix" size={22} color={colors.text} />
              <Text style={styles.primaryBtnText}>Générer avec l&apos;IA</Text>
            </Pressable>
          </View>
        )}

        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.mint} />
            <Text style={styles.loadingText}>Génération IA en cours…</Text>
            <Text style={styles.loadingSub}>Peut prendre 1 à 3 minutes · ne quitte pas l&apos;écran</Text>
          </View>
        )}

        {imageUri && !loading && (
          <View style={styles.result}>
            <Image source={{ uri: imageUri }} style={styles.wallpaper} contentFit="cover" />
            {sourceLabel(result?.source) && (
              <Text style={styles.source}>{sourceLabel(result?.source)}</Text>
            )}

            <View style={styles.actions}>
              <Pressable
                style={[styles.primaryBtn, saving && styles.btnDisabled]}
                onPress={() => void saveWallpaper()}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="share-variant" size={22} color={colors.text} />
                    <Text style={styles.primaryBtnText}>Enregistrer / Partager</Text>
                  </>
                )}
              </Pressable>

              <Text style={styles.shareHint}>
                Sur Expo Go : choisis « Enregistrer dans Galerie » ou « Photos » dans le menu de partage.
              </Text>

              <Pressable style={styles.secondaryBtn} onPress={() => void generate()}>
                <Text style={styles.secondaryBtnText}>Régénérer</Text>
              </Pressable>

              <Pressable style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.secondaryBtnText}>Retour collection</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 4,
    borderBottomColor: colors.border,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: font.pixel,
    fontSize: 12,
    color: colors.text,
  },
  subtitle: {
    fontFamily: font.sansBold,
    color: colors.mint,
    fontSize: 16,
    marginTop: 4,
  },
  hint: {
    fontFamily: font.sans,
    color: colors.caption,
    fontSize: 12,
    marginTop: 6,
    lineHeight: 17,
  },
  error: {
    marginHorizontal: 16,
    marginTop: 12,
    fontFamily: font.sansBold,
    color: '#fecaca',
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 12,
    textAlign: 'center',
  },
  placeholder: {
    alignItems: 'center',
    padding: 24,
    gap: 20,
  },
  previewCard: {
    width: 200,
    height: 280,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: colors.cardBorder,
  },
  center: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 16,
  },
  loadingSub: {
    fontFamily: font.sans,
    color: colors.caption,
    textAlign: 'center',
  },
  result: {
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
    gap: 12,
  },
  wallpaper: {
    width: '100%',
    maxWidth: 360,
    aspectRatio: 1080 / 1920,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: colors.cardBorder,
    backgroundColor: '#0a0a1a',
  },
  source: {
    fontFamily: font.sansMedium,
    color: colors.indigoText,
    fontSize: 13,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    maxWidth: 360,
    gap: 10,
    marginTop: 8,
  },
  shareHint: {
    fontFamily: font.sans,
    fontSize: 11,
    color: colors.caption,
    textAlign: 'center',
    lineHeight: 16,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.border,
    paddingVertical: 14,
    borderRadius: 14,
  },
  primaryBtnText: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 15,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  secondaryBtnText: {
    fontFamily: font.sansSemi,
    color: colors.indigoText,
  },
  btnDisabled: {
    opacity: 0.7,
  },
});
