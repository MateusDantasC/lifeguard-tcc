import { getApiUrl } from './api';
import { useConnectionStore } from '../store/connectionStore';

const HEALTH_TIMEOUT_MS = 5_000;

export async function checkApiConnection() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  useConnectionStore.getState().setChecking();

  try {
    const baseUrl = getApiUrl().replace(/\/api\/?$/, '');
    const response = await fetch(`${baseUrl}/health`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Health check ${response.status}`);
    useConnectionStore.getState().setOnline();
    return true;
  } catch {
    useConnectionStore.getState().setOffline('Não foi possível acessar o LifeGuard. Confira sua internet e tente novamente.');
    return false;
  } finally {
    clearTimeout(timeout);
  }
}
