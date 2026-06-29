import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

export type ToastType = 'success' | 'error' | 'info';

type ToastState = {
  message: string;
  type: ToastType;
  visible: boolean;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const ICON: Record<ToastType, keyof typeof MaterialCommunityIcons.glyphMap> = {
  success: 'check-circle',
  error: 'alert-circle',
  info: 'information',
};

const ACCENT: Record<ToastType, string> = {
  success: colors.mint,
  error: colors.danger,
  info: colors.violetLight,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', visible: false });

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -16, duration: 200, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        setToast((t) => ({ ...t, visible: false }));
      }
    });
  }, [opacity, translateY]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
      setToast({ message, type, visible: true });
      opacity.setValue(0);
      translateY.setValue(-16);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
      hideTimer.current = setTimeout(hide, type === 'error' ? 4200 : 3200);
    },
    [hide, opacity, translateY],
  );

  const value = useMemo(
    () => ({
      showToast,
      showSuccess: (message: string) => showToast(message, 'success'),
      showError: (message: string) => showToast(message, 'error'),
      showInfo: (message: string) => showToast(message, 'info'),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast.visible && (
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.host,
            {
              top: insets.top + 10,
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <Pressable onPress={hide} style={[styles.toast, { borderLeftColor: ACCENT[toast.type] }]}>
            <MaterialCommunityIcons name={ICON[toast.type]} size={22} color={ACCENT[toast.type]} />
            <Text style={styles.message} numberOfLines={4}>
              {toast.message}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 20,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.bgDeep,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.borderAccent,
    borderLeftWidth: 5,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  message: {
    flex: 1,
    fontFamily: font.sansMedium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
});
