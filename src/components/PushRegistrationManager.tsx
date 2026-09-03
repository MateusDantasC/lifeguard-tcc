import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { registerForPushNotifications } from '../services/notifications';

export default function PushRegistrationManager() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;
    void registerForPushNotifications(true).catch(() => undefined);
  }, [token]);

  return null;
}
