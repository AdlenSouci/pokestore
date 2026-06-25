import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AuthProvider } from './src/context/AuthContext';
import { CardDetailScreen } from './src/screens/CardDetailScreen';
import { CartScreen } from './src/screens/CartScreen';
import { CollectionScreen } from './src/screens/CollectionScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { colors } from './src/theme/colors';
import { font } from './src/theme/typography';
import type { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: colors.border },
  headerTintColor: colors.text,
  headerTitleStyle: {
    fontFamily: font.sansSemi,
    fontSize: 17,
  },
  contentStyle: { backgroundColor: colors.bg },
};

export default function App() {
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.mint} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Shop" component={ShopScreen} options={{ headerShown: false }} />
              <Stack.Screen name="CardDetail" component={CardDetailScreen} options={{ title: 'Carte' }} />
              <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Connexion' }} />
              <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Inscription' }} />
              <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Orders" component={OrdersScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Collection" component={CollectionScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
