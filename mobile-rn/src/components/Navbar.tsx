import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { font } from '../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function Navbar() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { user, cartCount, logout } = useAuth();

  return (
    <LinearGradient
      colors={['#5a4f99', '#8b7ec8', '#2d3561']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.gradient,
        {
          paddingTop: Math.max(insets.top, 8),
          borderBottomWidth: 4,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.inner}>
        <View style={styles.left}>
          <Pressable onPress={() => navigation.navigate('Home')}>
            <Text style={styles.logo} numberOfLines={1}>
              ⚡ PokéCard
            </Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Shop')} style={styles.navLink}>
            <Text style={styles.navLinkText}>BOUTIQUE</Text>
          </Pressable>
        </View>

        <View style={styles.right}>
          {user ? (
            <>
              <View style={styles.userBox}>
                <Text style={styles.userLabel}>Dresseur</Text>
                <Text style={styles.userName} numberOfLines={1}>
                  {user.name}
                </Text>
              </View>
              <Pressable onPress={logout} style={styles.iconBtn} accessibilityLabel="Déconnexion">
                <MaterialCommunityIcons name="logout" size={22} color={colors.text} />
              </Pressable>
            </>
          ) : (
            <View style={styles.authRow}>
              <Pressable
                style={styles.btnConnexion}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.btnConnexionText}>Connexion</Text>
              </Pressable>
              <Pressable
                style={styles.btnInscription}
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.btnInscriptionText}>Inscription</Text>
              </Pressable>
            </View>
          )}

          <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
            <MaterialCommunityIcons name="cart" size={26} color={colors.text} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </LinearGradient>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    minHeight: 52,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    flexShrink: 1,
  },
  logo: {
    fontFamily: font.pixel,
    fontSize: 12,
    color: colors.text,
    letterSpacing: -0.5,
  },
  navLink: {
    paddingVertical: 4,
  },
  navLinkText: {
    fontFamily: font.sansBold,
    fontSize: 12,
    color: colors.text,
    textTransform: 'uppercase',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userBox: {
    maxWidth: 100,
  },
  userLabel: {
    fontFamily: font.sans,
    fontSize: 9,
    textTransform: 'uppercase',
    opacity: 0.8,
    color: colors.text,
  },
  userName: {
    fontFamily: font.sansBold,
    fontSize: 12,
    color: colors.text,
  },
  authRow: {
    flexDirection: 'row',
    gap: 6,
  },
  btnConnexion: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.bg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.bgDeep,
  },
  btnConnexionText: {
    fontFamily: font.sansBold,
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.text,
  },
  btnInscription: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.mint,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },
  btnInscriptionText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: colors.inputText,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 12,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  badgeText: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 9,
  },
});
