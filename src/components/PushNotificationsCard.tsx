import { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { PermissionStatus } from 'expo-notifications';
import Card from './Card';
import AppButton from './AppButton';
import { colors, fonts } from '../theme/theme';
import { getNotificationPermission, registerForPushNotifications, sendTestNotification } from '../services/notifications';
import { ApiError } from '../services/api';

export default function PushNotificationsCard() {
  const [status, setStatus] = useState<PermissionStatus | 'unknown'>('unknown');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void getNotificationPermission().then((permission) => setStatus(permission.status)).catch(() => setStatus('unknown'));
  }, []);

  async function enable() {
    setLoading(true);
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
      setLoading(false);
    }
  }

  async function test() {
    setLoading(true);
    setError('');
    try {
      await registerForPushNotifications(false);
      await sendTestNotification();
      Alert.alert('Teste enviado', 'A notificação deve aparecer em alguns segundos.');
    } catch (requestError) {
      setError(requestError instanceof ApiError || requestError instanceof Error ? requestError.message : 'Não foi possível enviar o teste.');
    } finally {
      setLoading(false);
    }
  }

  const enabled = status === 'granted';
  return (
    <Card style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.title}>Notificações</Text>
        <Text style={styles.description}>{enabled ? 'Ativadas neste aparelho.' : 'Ative para receber alertas e avisos importantes.'}</Text>
      </View>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      {enabled ? <AppButton label="Enviar notificação de teste" icon="bell-ring-outline" variant="secondary" onPress={() => void test()} loading={loading} /> : <AppButton label="Ativar notificações" icon="bell-outline" onPress={() => void enable()} loading={loading} />}
      {status === 'denied' ? <AppButton label="Abrir configurações do aparelho" variant="text" onPress={() => void Linking.openSettings()} disabled={loading} /> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 18 },
  copy: { marginBottom: 14 },
  title: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  description: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textSecondary, marginTop: 3 },
  error: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.emberText, marginBottom: 12 },
});
