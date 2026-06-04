import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
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

  const onSubmit = async () => {
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Inscription', e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Inscription</Text>
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    gap: 12,
  },
  title: {
    fontFamily: font.pixel,
    fontSize: 14,
    color: colors.mint,
    marginBottom: 16,
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
  link: {
    color: colors.indigoText,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});
