import { useEffect, useState } from 'react';
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
import { useAuthStore } from './src/store/authStore';
import { apiRequest, ApiError } from './src/services/api';
import type { AuthUser } from './src/store/authStore';
import AppErrorBoundary from './src/components/AppErrorBoundary';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 450, fade: true });

const STARTUP_TIMEOUT_MS = 4_000;

async function waitAtMost<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => {
        timeout = setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export default function App() {
  const [bootstrapped, setBootstrapped] = useState(false);
  const [fontWaitExpired, setFontWaitExpired] = useState(false);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
  });

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      const restorePromise = restoreSession().catch(() => undefined);

      await waitAtMost(restorePromise, STARTUP_TIMEOUT_MS);
      if (active) setBootstrapped(true);

      void restorePromise.then(() => {
        const session = useAuthStore.getState();
        if (!session.token) return;

        void apiRequest<{ usuario: AuthUser }>('/auth/me')
          .then(({ usuario }) => useAuthStore.getState().setUser(usuario))
          .catch((error) => {
            if (error instanceof ApiError && error.status === 401) {
              useAuthStore.getState().logout();
            }
          });
      });
    }

    void bootstrap();
    return () => { active = false; };
  }, [restoreSession]);

  useEffect(() => {
    const timeout = setTimeout(() => setFontWaitExpired(true), STARTUP_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, []);

  const appReady = bootstrapped && (fontsLoaded || Boolean(fontError) || fontWaitExpired);

  useEffect(() => {
    if (appReady) void SplashScreen.hideAsync();
  }, [appReady]);

  if (!appReady) return null;

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <AppErrorBoundary>
          <AppNavigator />
        </AppErrorBoundary>
      </View>
    </SafeAreaProvider>
  );
}
