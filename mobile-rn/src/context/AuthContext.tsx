import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authTokenRef } from '../auth/tokenRef';
import * as authApi from '../services/authApi';
import * as cartService from '../services/cart';
import { STORAGE_ACCESS_TOKEN, STORAGE_USER_JSON } from '../storage/keys';

export interface AuthUser {
  name: string;
  email: string;
}

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  cartCount: number;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshCart: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = useCallback(async () => {
    if (!authTokenRef.current) {
      setCartCount(0);
      return;
    }
    try {
      const cart = await cartService.getCart();
      setCartCount(cart.items.length);
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_ACCESS_TOKEN);
        const userStr = await AsyncStorage.getItem(STORAGE_USER_JSON);
        if (token) {
          authTokenRef.current = token;
        }
        if (userStr) {
          const u = JSON.parse(userStr) as AuthUser;
          if (!cancelled) setUser(u);
        }
        if (token) {
          await refreshCart();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshCart]);

  const persistAuth = async (data: authApi.AuthResponse) => {
    authTokenRef.current = data.access_token;
    await AsyncStorage.setItem(STORAGE_ACCESS_TOKEN, data.access_token);
    const u = { name: data.user.name, email: data.user.email };
    await AsyncStorage.setItem(STORAGE_USER_JSON, JSON.stringify(u));
    setUser(u);
    await refreshCart();
  };

  const login = async (email: string, password: string) => {
    const data = await authApi.loginRequest(email, password);
    await persistAuth(data);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await authApi.registerRequest(email, password, name);
    await persistAuth(data);
  };

  const logout = async () => {
    authTokenRef.current = null;
    await AsyncStorage.multiRemove([STORAGE_ACCESS_TOKEN, STORAGE_USER_JSON]);
    setUser(null);
    setCartCount(0);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      cartCount,
      login,
      register,
      logout,
      refreshCart,
    }),
    [user, loading, cartCount, refreshCart],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return ctx;
}
