import { useCallback, useEffect, useState } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppShell } from '../components/AppShell';
import { InlineErrorBanner } from '../components/InlineErrorBanner';
import { useToast } from '../context/ToastContext';
import { fetchCaptcha, sendContactMessage } from '../services/contact';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Contact'>;

export function ContactScreen({ navigation }: Props) {
  const { showSuccess } = useToast();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    captchaAnswer: '',
    website: '',
  });
  const [captcha, setCaptcha] = useState<{ question: string; token: string } | null>(null);
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCaptcha = useCallback(async () => {
    try {
      setCaptchaLoading(true);
      const data = await fetchCaptcha();
      setCaptcha(data);
      setForm((f) => ({ ...f, captchaAnswer: '' }));
      setError(null);
    } catch {
      setError('Impossible de charger le captcha.');
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  const onSubmit = async () => {
    if (!captcha) return;
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('Remplis tous les champs.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        captchaAnswer: Number(form.captchaAnswer),
        captchaToken: captcha.token,
        website: form.website,
      });
      showSuccess('Message envoyé ! Nous te répondrons rapidement.');
      setForm({ name: '', email: '', subject: '', message: '', captchaAnswer: '', website: '' });
      await loadCaptcha();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'envoi");
      await loadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <MaterialCommunityIcons name="email-outline" size={32} color={colors.mint} />
            <Text style={styles.title}>CONTACT</Text>
            <Text style={styles.subtitle}>Une question ? Écris-nous.</Text>
          </View>

          <InlineErrorBanner message={error ?? ''} />

          <View style={styles.form}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(name) => setForm((f) => ({ ...f, name }))}
              placeholder="Ton nom"
              placeholderTextColor={colors.indigoText}
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(email) => setForm((f) => ({ ...f, email }))}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="toi@exemple.com"
              placeholderTextColor={colors.indigoText}
            />

            <Text style={styles.label}>Sujet</Text>
            <TextInput
              style={styles.input}
              value={form.subject}
              onChangeText={(subject) => setForm((f) => ({ ...f, subject }))}
              placeholder="Objet du message"
              placeholderTextColor={colors.indigoText}
            />

            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.message}
              onChangeText={(message) => setForm((f) => ({ ...f, message }))}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholder="Ton message (10 caractères min.)"
              placeholderTextColor={colors.indigoText}
            />

            <View style={styles.captchaRow}>
              <Text style={styles.label}>Vérification anti-robot</Text>
              <Pressable onPress={loadCaptcha} accessibilityLabel="Nouveau captcha">
                <MaterialCommunityIcons name="refresh" size={20} color={colors.mint} />
              </Pressable>
            </View>
            <Text style={styles.captchaQuestion}>
              {captchaLoading ? 'Chargement…' : captcha?.question}
            </Text>
            <TextInput
              style={styles.input}
              value={form.captchaAnswer}
              onChangeText={(captchaAnswer) => setForm((f) => ({ ...f, captchaAnswer }))}
              keyboardType="number-pad"
              placeholder="Réponse"
              placeholderTextColor={colors.indigoText}
            />

            <Pressable
              onPress={onSubmit}
              disabled={loading || captchaLoading || !captcha}
              style={({ pressed }) => [styles.btnOuter, pressed && { opacity: 0.9 }]}
            >
              <LinearGradient
                colors={['#7ec8a3', '#5a4f99']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGrad}
              >
                {loading ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="send" size={20} color={colors.text} />
                    <Text style={styles.btnText}>Envoyer</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable onPress={() => navigation.goBack()} style={styles.backLink}>
              <Text style={styles.backText}>Retour</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontFamily: font.pixel,
    fontSize: 14,
    color: colors.text,
  },
  subtitle: {
    fontFamily: font.sans,
    color: colors.indigoText,
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'rgba(90,79,153,0.25)',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.border,
    padding: 16,
    gap: 4,
  },
  label: {
    fontFamily: font.sansBold,
    color: colors.indigoText,
    fontSize: 13,
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    fontFamily: font.sans,
    backgroundColor: '#fff',
    color: colors.inputText,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textarea: {
    minHeight: 120,
  },
  captchaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  captchaQuestion: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 16,
    marginBottom: 4,
  },
  btnOuter: {
    marginTop: 20,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
  },
  btnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  btnText: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 16,
  },
  backLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  backText: {
    fontFamily: font.sansMedium,
    color: colors.mint,
    fontSize: 14,
  },
});
