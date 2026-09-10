import { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { PermissionStatus } from 'expo-notifications';
import Card from './Card';
import AppButton from './AppButton';
import { colors, fonts } from '../theme/theme';
import { getNotificationPermission, registerForPushNotifications, sendTestNotification } from '../services/notifications';
import { ApiError } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function PushNotificationsCard() {
  const userType = useAuthStore((state) => state.user?.tipo);
  const [status, setStatus] = useState<PermissionStatus | 'unknown'>('unknown');
  const [loadingAction, setLoadingAction] = useState<'enable' | 'test' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void getNotificationPermission().then((permission) => setStatus(permission.status)).catch(() => setStatus('unknown'));
  }, []);

  async function enable() {
    setLoadingAction('enable');
    setError('');
    try {
      await registerForPushNotifications(true);
      setStatus(PermissionStatus.GRANTED);
      Alert.alert('Notificações ativadas', 'Este aparelho poderá receber alertas do LifeGuard.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível ativar as notificações.');
      const permission = await getNotificationPermission().catch(() => null);
      if (permission) setStatus(permission.status);
    } finally {
      setLoadingAction(null);
    }
  }

  async function test() {
    setLoadingAction('test');
    setError('');
    try {
      if (userType !== 'idoso') await registerForPushNotifications(false);
      const result = await sendTestNotification();
      Alert.alert(
        'Teste enviado',
        result.destino === 'cuidadores'
          ? `A notificação foi enviada para ${result.enviadas} ${result.enviadas === 1 ? 'aparelho de cuidador' : 'aparelhos de cuidadores'}.`
          : 'A notificação deve aparecer neste aparelho em alguns segundos.',
      );
    } catch (requestError) {
      setError(requestError instanceof ApiError || requestError instanceof Error ? requestError.message : 'Não foi possível enviar o teste.');
    } finally {
      setLoadingAction(null);
    }
  }

  const enabled = status === 'granted';
  const isPatient = userType === 'idoso';
  return (
    <Card style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.title}>Notificações</Text>
        <Text style={styles.description}>{enabled ? 'Ativadas neste aparelho.' : 'Ative para receber alertas e avisos importantes.'}</Text>
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {!enabled ? <AppButton label="Ativar notificações neste aparelho" icon="bell-outline" onPress={() => void enable()} loading={loadingAction === 'enable'} disabled={loadingAction !== null} /> : null}
      {enabled && !isPatient ? <AppButton label="Testar neste aparelho" icon="bell-ring-outline" variant="secondary" onPress={() => void test()} loading={loadingAction === 'test'} disabled={loadingAction !== null} /> : null}
      {isPatient ? <AppButton label="Enviar teste aos cuidadores" icon="bell-ring-outline" variant="secondary" style={!enabled ? styles.secondaryAction : undefined} onPress={() => void test()} loading={loadingAction === 'test'} disabled={loadingAction !== null} /> : null}
      {status === 'denied' ? <AppButton label="Abrir configurações do aparelho" variant="text" onPress={() => void Linking.openSettings()} disabled={loadingAction !== null} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 18 },
  copy: { marginBottom: 14 },
  title: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  description: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textSecondary, marginTop: 3 },
  error: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.emberText, marginBottom: 12 },
  secondaryAction: { marginTop: 10 },
});
