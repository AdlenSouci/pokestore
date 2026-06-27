import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../types/navigation';
import { BattleAnim } from './BattleAnim';
import { Logo } from './Logo';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function Navbar() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { user, cartCount, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const go = (screen: 'Home' | 'Shop' | 'Cart' | 'Login' | 'Register' | 'Orders' | 'Collection' | 'Contact') => {
    closeMenu();
    navigation.navigate(screen);
  };

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  return (
    <View>
      <LinearGradient
        colors={['#5a4f99', '#8b7ec8', '#2d3561']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          {
            paddingTop: Math.max(insets.top, 8),
            borderBottomWidth: menuOpen ? 0 : 4,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.inner}>
          <Logo size="nav" onPress={() => go('Home')} style={styles.logoWrap} />

          <View style={styles.center}>
            <BattleAnim size="nav" />
          </View>

          <View style={styles.right}>
            <Pressable
              style={styles.iconBtn}
              onPress={() => go('Cart')}
              accessibilityLabel="Panier"
            >
              <MaterialCommunityIcons name="cart" size={24} color={colors.text} />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              style={styles.iconBtn}
              onPress={() => setMenuOpen((o) => !o)}
              accessibilityLabel={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              <MaterialCommunityIcons
                name={menuOpen ? 'close' : 'menu'}
                size={26}
                color={colors.text}
              />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {menuOpen && (
        <View style={styles.menu}>
          <MenuItem label="Accueil" icon="home" onPress={() => go('Home')} />
          <MenuItem label="Boutique" icon="store" onPress={() => go('Shop')} />
          {user && (
            <>
              <MenuItem label="Ma collection" icon="cards" onPress={() => go('Collection')} />
              <MenuItem label="Mes commandes" icon="package-variant" onPress={() => go('Orders')} />
            </>
          )}
          <MenuItem label="Contact" icon="email-outline" onPress={() => go('Contact')} />
          <View style={styles.menuDivider} />
          {user ? (
            <>
              <Text style={styles.menuUser}>Dresseur · {user.name}</Text>
              <MenuItem label="Déconnexion" icon="logout" onPress={handleLogout} danger />
            </>
          ) : (
            <>
              <MenuItem label="Connexion" icon="login" onPress={() => go('Login')} />
              <MenuItem label="Inscription" icon="account-plus" onPress={() => go('Register')} accent />
            </>
          )}
        </View>
      )}
    </View>
  );
}

function MenuItem({
  label,
  icon,
  onPress,
  danger,
  accent,
}: {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  danger?: boolean;
  accent?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={danger ? '#ffb4b4' : accent ? colors.mint : colors.text}
      />
      <Text style={[styles.menuItemText, danger && styles.menuItemDanger, accent && styles.menuItemAccent]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 10,
    minHeight: 48,
    gap: 8,
  },
  logoWrap: {
    flexShrink: 0,
    maxWidth: '38%',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  badgeText: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 8,
  },
  menu: {
    backgroundColor: colors.bgDeep,
    borderBottomWidth: 4,
    borderBottomColor: colors.borderAccent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  menuItemPressed: {
    backgroundColor: 'rgba(123, 110, 184, 0.35)',
  },
  menuItemText: {
    fontFamily: font.sansBold,
    fontSize: 15,
    color: colors.text,
  },
  menuItemDanger: {
    color: '#ffb4b4',
  },
  menuItemAccent: {
    color: colors.mint,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(90, 79, 153, 0.5)',
    marginVertical: 6,
  },
  menuUser: {
    fontFamily: font.sans,
    fontSize: 11,
    color: colors.indigoText,
    textTransform: 'uppercase',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
});
