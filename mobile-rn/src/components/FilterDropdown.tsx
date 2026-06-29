import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

export type FilterOption = { label: string; value: string };

type Props = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

export function FilterDropdown({ label, value, options, onChange }: Props) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const slide = useRef(new Animated.Value(0)).current;

  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (open) {
      slide.setValue(0);
      Animated.spring(slide, {
        toValue: 1,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [open, slide]);

  const close = () => setOpen(false);

  const pick = (next: string) => {
    onChange(next);
    close();
  };

  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [280, 0],
  });

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
      >
        <Text style={styles.triggerText} numberOfLines={1}>
          {selected?.label ?? '—'}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={22} color={colors.inputText} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Fermer" />
          <Animated.View
            style={[
              styles.sheet,
              {
                transform: [{ translateY }],
                paddingBottom: Math.max(insets.bottom, 16) + 12,
              },
            ]}
          >
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{label}</Text>
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {options.map((opt) => {
                const active = opt.value === value;
                return (
                  <Pressable
                    key={opt.value || '__all__'}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => pick(opt.value)}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {opt.label}
                    </Text>
                    {active && (
                      <MaterialCommunityIcons name="check" size={20} color={colors.mint} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  label: {
    fontFamily: font.sansSemi,
    fontSize: 11,
    color: colors.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  triggerPressed: { opacity: 0.92 },
  triggerText: {
    flex: 1,
    fontFamily: font.sans,
    color: colors.inputText,
    fontSize: 15,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgDeep,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 3,
    borderColor: colors.borderAccent,
    maxHeight: '70%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderAccent,
    marginTop: 10,
    marginBottom: 8,
  },
  sheetTitle: {
    fontFamily: font.sansBold,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  list: { paddingHorizontal: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  optionActive: { backgroundColor: 'rgba(126, 200, 163, 0.15)' },
  optionText: {
    fontFamily: font.sans,
    fontSize: 15,
    color: colors.textMuted,
    flex: 1,
  },
  optionTextActive: {
    fontFamily: font.sansBold,
    color: colors.mint,
  },
});
