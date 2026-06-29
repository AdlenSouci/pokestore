import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

export type DialogButton = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
};

type Props = {
  visible: boolean;
  title: string;
  message: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  buttons: DialogButton[];
  onRequestClose?: () => void;
};

export function AppDialog({ visible, title, message, icon = 'information', buttons, onRequestClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onRequestClose} accessibilityLabel="Fermer" />
        <View style={[styles.card, { marginBottom: insets.bottom + 16 }]}>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name={icon} size={28} color={colors.mint} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            {buttons.map((btn) => (
              <Pressable
                key={btn.label}
                onPress={btn.onPress}
                style={({ pressed }) => [
                  styles.btn,
                  btn.variant === 'primary' && styles.btnPrimary,
                  btn.variant === 'secondary' && styles.btnSecondary,
                  btn.variant === 'ghost' && styles.btnGhost,
                  !btn.variant && styles.btnPrimary,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text
                  style={[
                    styles.btnText,
                    btn.variant === 'ghost' && styles.btnTextGhost,
                    btn.variant === 'secondary' && styles.btnTextSecondary,
                  ]}
                >
                  {btn.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.bgDeep,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.borderAccent,
    padding: 22,
    zIndex: 1,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(126, 200, 163, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: font.sansBold,
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontFamily: font.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.caption,
    textAlign: 'center',
    marginBottom: 20,
  },
  actions: {
    gap: 10,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  btnPrimary: {
    backgroundColor: colors.mint,
    borderColor: colors.border,
  },
  btnSecondary: {
    backgroundColor: colors.borderAccent,
    borderColor: colors.border,
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  btnText: {
    fontFamily: font.sansBold,
    fontSize: 15,
    color: colors.inputText,
  },
  btnTextSecondary: {
    color: colors.text,
  },
  btnTextGhost: {
    color: colors.mint,
    fontFamily: font.sansMedium,
  },
});
