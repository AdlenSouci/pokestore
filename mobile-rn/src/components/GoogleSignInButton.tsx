import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../context/AuthContext';
import { getApiBaseUrl } from '../config/api';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

type Props = {
  disabled?: boolean;
  loading?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  onSuccess?: () => void;
};

export function GoogleSignInButton({ disabled, loading, onLoadingChange, onSuccess }: Props) {
  const { loginWithGoogleToken } = useAuth();

  const onPress = async () => {
    onLoadingChange?.(true);
    try {
      const redirectUri = Linking.createURL('auth');
      const startUrl = `${getApiBaseUrl()}/auth/google/mobile?redirect_uri=${encodeURIComponent(redirectUri)}`;
      const result = await WebBrowser.openAuthSessionAsync(startUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const parsed = new URL(result.url);
        const token = parsed.searchParams.get('token');
        const error = parsed.searchParams.get('error');
        if (error) {
          throw new Error(decodeURIComponent(error));
        }
        if (token) {
          await loginWithGoogleToken(token);
          onSuccess?.();
        }
      }
    } catch (e) {
      Alert.alert('Google', e instanceof Error ? e.message : 'Connexion Google impossible');
    } finally {
      onLoadingChange?.(false);
    }
  };

  return (
    <Pressable
      style={[styles.btn, (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel="Continuer avec Google"
    >
      {loading ? (
        <ActivityIndicator color={colors.inputText} />
      ) : (
        <View style={styles.row}>
          <MaterialCommunityIcons name="google" size={22} color="#4285F4" />
          <Text style={styles.text}>Continuer avec Google</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.inputBg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  disabled: { opacity: 0.6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    fontFamily: font.sansBold,
    color: colors.inputText,
    fontSize: 15,
  },
});
