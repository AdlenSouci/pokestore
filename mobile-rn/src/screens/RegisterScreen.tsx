import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { InlineErrorBanner } from '../components/InlineErrorBanner';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Renseigne tous les champs.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Inscription impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Inscription</Text>
        <InlineErrorBanner message={error ?? ''} />

        <GoogleSignInButton
          loading={loading}
          onLoadingChange={setLoading}
          onSuccess={() => navigation.goBack()}
          onError={setError}
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou email</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Sacha"
          placeholderTextColor={colors.indigoText}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="toi@exemple.com"
          placeholderTextColor={colors.indigoText}
        />
        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.indigoText}
        />
        <Pressable
          style={[styles.btn, loading && styles.disabled]}
          onPress={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.inputText} />
          ) : (
            <Text style={styles.btnText}>Créer un compte</Text>
          )}
        </Pressable>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Déjà un compte ? Connexion</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontFamily: font.pixel,
    fontSize: 14,
    color: colors.mint,
    marginBottom: 8,
    textAlign: 'center',
  },
  label: {
    fontFamily: font.sansSemi,
    color: colors.indigoText,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  input: {
    fontFamily: font.sans,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    padding: 14,
    color: colors.inputText,
    fontSize: 16,
  },
  btn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.mint,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  disabled: { opacity: 0.6 },
  btnText: {
    fontFamily: font.sansBold,
    color: colors.inputText,
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.35,
  },
  dividerText: {
    fontFamily: font.sansSemi,
    color: colors.indigoText,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  link: {
    color: colors.mint,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});
