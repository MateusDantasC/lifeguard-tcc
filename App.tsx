import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible';
import AppNavigator from './src/navigation/AppNavigator';
import * as Updates from 'expo-updates';
import { useAuthStore } from './src/store/authStore';
import { apiRequest, ApiError } from './src/services/api';
import type { AuthUser } from './src/store/authStore';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 450, fade: true });

export default function App() {
  const [bootstrapped, setBootstrapped] = useState(false);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
  });

  useEffect(() => {
    let active = true;
    async function bootstrap() {
      try {
        if (Updates.isEnabled) {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
            return;
          }
        }
      } catch {
        // Sem internet ou em desenvolvimento: abre normalmente com a versão disponível.
      }
      await restoreSession();
      if (active) setBootstrapped(true);
      const session = useAuthStore.getState();
      if (session.token) {
        void apiRequest<{ usuario: AuthUser }>('/auth/me')
          .then(({ usuario }) => useAuthStore.getState().setUser(usuario))
          .catch((error) => { if (error instanceof ApiError && error.status === 401) useAuthStore.getState().logout(); });
      }
    }
    void bootstrap();
    return () => { active = false; };
  }, [restoreSession]);

  const onLayout = useCallback(async () => {
    if (fontsLoaded && bootstrapped) await SplashScreen.hideAsync();
  }, [bootstrapped, fontsLoaded]);

  if (!fontsLoaded || !bootstrapped) return null;

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }} onLayout={onLayout}>
        <StatusBar style="dark" />
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}
