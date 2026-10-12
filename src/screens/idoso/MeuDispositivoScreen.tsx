import { useCallback, useRef, useState } from 'react';
import { Alert, AppState, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import Card from '../../components/Card';
import AppButton from '../../components/AppButton';
import InlineNotice from '../../components/InlineNotice';
import LoadingState from '../../components/LoadingState';
import { apiRequest, ApiError, formatDateTime } from '../../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'MeuDispositivo'>;
type Device = { id: string; nickname: string; lastSeenAt: string | null; conectado: boolean; isSimulator: boolean };
export default function MeuDispositivoScreen({ navigation }: Props) {
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [scenario, setScenario] = useState<'normal' | 'alto' | 'sem_contato'>('normal');
  const [running, setRunning] = useState(false);
  const [samples, setSamples] = useState(0);
  const sending = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null; setRunning(false);
  }, []);
  const load = useCallback(async () => {
    try {
      const result = await apiRequest<{ dispositivo: Device | null }>('/dispositivos/me');
      setDevice(result.dispositivo); setError('');
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Não foi possível consultar o dispositivo.'); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => {
    void load();
    const timer = setInterval(() => void load(), 15_000);
    const subscription = AppState.addEventListener('change', (state) => { if (state !== 'active') stop(); });
    return () => { clearInterval(timer); subscription.remove(); stop(); };
  }, [load, stop]));
  function start() {
    if (timerRef.current || sending.current || AppState.currentState !== 'active') return;
    setSamples(0); setError(''); setRunning(true);
    const send = async () => {
      if (sending.current) return;
      sending.current = true;
      try {
        await apiRequest('/dispositivos/me/simular', { method: 'POST', body: JSON.stringify({ cenario: scenario }) });
        setSamples((count) => count + 1); await load();
      } catch (e) { stop(); setError(e instanceof ApiError ? e.message : 'Simulação pausada: confira a conexão.'); }
      finally { sending.current = false; }
    };
    timerRef.current = setInterval(() => void send(), 5_000);
    void send();
  }
  function revoke() {
    Alert.alert('Desconectar dispositivo?', 'A credencial será revogada e o ESP32 não poderá mais enviar leituras. O histórico será preservado.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desconectar', style: 'destructive', onPress: async () => {
        stop(); setBusy(true);
        try { await apiRequest('/dispositivos/me', { method: 'DELETE' }); await load(); }
        catch (e) { setError(e instanceof ApiError ? e.message : 'Não foi possível desconectar.'); }
        finally { setBusy(false); }
      } },
    ]);
  }
  return <SafeAreaView style={styles.safe} edges={['top']}>
    <BackHeader title="Meu dispositivo" onBack={() => navigation.goBack()} />
    <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { setLoading(true); void load(); }} />}>
      {error ? <InlineNotice tone="warning" message={error} /> : null}
      {loading && !device ? <LoadingState message="Consultando dispositivo..." /> : <>
        <Card><Text style={styles.heading}>{error ? 'Estado indisponível' : device?.conectado ? 'Sinal recebido' : device ? 'Aguardando sinal' : 'Nenhum dispositivo configurado'}</Text>
          <Text style={styles.text}>{device ? device.nickname : 'Configure uma demonstração sem hardware ou seu ESP32.'}</Text>
          {device ? <Text style={styles.text}>Último contato: {device.lastSeenAt ? formatDateTime(device.lastSeenAt) : 'ainda não recebido'}</Text> : null}
        </Card>
        {device?.isSimulator ? <Card>
          <Text style={styles.heading}>SIMULAÇÃO · dados fictícios</Text>
          <Text style={styles.text}>Envio a cada 5 segundos, somente nesta tela com o app aberto. Os cuidadores vinculados recebem os alertas identificados como demonstração. Pause para trocar o cenário.</Text>
          {(['normal', 'alto', 'sem_contato'] as const).map((value) => <AppButton key={value} label={`${scenario === value ? '✓ ' : ''}${value === 'normal' ? 'Dentro dos limites' : value === 'alto' ? 'Batimento acima do limite' : 'Sensor sem contato'}`} variant="secondary" disabled={running || busy} onPress={() => setScenario(value)} />)}
          <Text style={styles.text}>{samples} leituras enviadas nesta execução. O alerta exige 3 leituras alteradas. Para repetir a demonstração, envie 3 leituras normais antes de voltar ao cenário alto.</Text>
          <AppButton label={running ? 'Pausar simulação' : 'Iniciar simulação'} disabled={busy} onPress={running ? stop : start} />
        </Card> : null}
        <InlineNotice message="Conexão indica comunicação recente com o servidor, não a precisão do sensor. Após 90 segundos sem sinal, o dispositivo aparece desconectado." />
        <AppButton label={device ? 'Preparar outro dispositivo' : 'Preparar dispositivo ou simulador'} icon="link-variant" onPress={() => navigation.navigate('ParearDispositivo')} disabled={busy || running} />
        {device ? <AppButton label="Desconectar dispositivo" variant="secondary" onPress={revoke} loading={busy} /> : null}
      </>}
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  heading: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.ink },
  text: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginTop: 10 },
});
