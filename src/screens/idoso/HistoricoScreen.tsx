import { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryScatter } from 'victory-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts, radii } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import SegmentedToggle from '../../components/SegmentedToggle';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import InlineNotice from '../../components/InlineNotice';
import { useAuthStore } from '../../store/authStore';
import { useFocusEffect } from '@react-navigation/native';
import { apiRequest, ApiError, formatDateTime } from '../../services/api';
import { fetchReadings, type Reading } from '../../services/monitoring';
import type { MonitoringAlert } from '../../store/monitoringStore';
import LoadingState from '../../components/LoadingState';

type Props = NativeStackScreenProps<RootStackParamList, 'Historico'>;

type Metrica = 'batimento' | 'temperatura';

export default function HistoricoScreen({ navigation, route }: Props) {
  const user = useAuthStore((state) => state.user);
  const elderId = route.params?.idosoId ?? user?.id;
  const nomeIdoso = route.params?.nome;
  const [metrica, setMetrica] = useState<Metrica>('batimento');
  const [leituras, setLeituras] = useState<Reading[]>([]);
  const [picos, setPicos] = useState<MonitoringAlert[]>([]);
  const [erro, setErro] = useState('');
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async (refresh = false) => {
    if (!elderId) return;
    if (refresh) setRefreshing(true);
    try {
      const [readings, alerts] = await Promise.all([
        fetchReadings(elderId, 100),
        apiRequest<{ alertas: Array<Omit<MonitoringAlert, 'horario'> & { horario: string }> }>('/alertas'),
      ]);
      setLeituras(readings);
      setPicos(alerts.alertas.filter((alert) => alert.idosoId === elderId).map((alert) => ({ ...alert, horario: formatDateTime(alert.horario) })));
      setErro('');
      setLoadState('ready');
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : 'Não foi possível carregar o histórico.');
      setLoadState('error');
    } finally {
      setRefreshing(false);
    }
  }, [elderId]);

  useFocusEffect(useCallback(() => { void loadHistory(); }, [loadHistory]));

  const pontos = useMemo(() => leituras
    .filter((reading) => reading.valida && (metrica === 'batimento' ? reading.batimento !== null : reading.temperatura !== null))
    .slice()
    .reverse()
    .map((reading, index) => ({
      x: index,
      y: metrica === 'batimento' ? reading.batimento! : reading.temperatura!,
    })), [leituras, metrica]);
  const unidade = metrica === 'batimento' ? 'bpm' : '°C';
  const picosFiltrados = picos.filter((pico) => pico.tipo === metrica);
  const values = pontos.map((point) => point.y);
  const media = values.length ? (values.reduce((total, value) => total + value, 0) / values.length).toFixed(metrica === 'batimento' ? 0 : 1) : '--';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title={nomeIdoso ? `Histórico de ${nomeIdoso}` : 'Histórico'} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadHistory(true)} tintColor={colors.coral} />}>
        {erro && (leituras.length > 0 || picos.length > 0) ? <InlineNotice tone="warning" message={erro} /> : null}
        {loadState === 'loading' && leituras.length === 0 && picos.length === 0 ? <LoadingState message="Carregando histórico de saúde..." /> : loadState === 'error' && leituras.length === 0 && picos.length === 0 ? (
          <EmptyState icon="cloud-alert-outline" title="Histórico indisponível" message={erro} actionLabel="Tentar novamente" onAction={() => { setLoadState('loading'); void loadHistory(); }} />
        ) : <>
        <SegmentedToggle
          value={metrica}
          onChange={setMetrica}
          options={[
            { value: 'batimento', label: 'Batimento' },
            { value: 'temperatura', label: 'Temperatura' },
          ]}
        />

        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View><Text style={styles.chartLabel}>Média nas últimas 24 horas</Text><Text style={styles.average}>{media} <Text style={styles.unit}>{unidade}</Text></Text></View>
            <View style={styles.range}><Text style={styles.rangeText}>{values.length ? `mín. ${Math.min(...values)} · máx. ${Math.max(...values)}` : 'sem dados'}</Text></View>
          </View>
          <VictoryChart height={200} padding={{ top: 10, bottom: 30, left: 40, right: 20 }}>
            <VictoryAxis
              style={{
                axis: { stroke: colors.border },
                tickLabels: { fontFamily: fonts.body, fontSize: 10, fill: colors.textSecondary },
                grid: { stroke: 'transparent' },
              }}
              tickFormat={(t) => `${t + 1}`}
            />
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: 'transparent' },
                tickLabels: { fontFamily: fonts.body, fontSize: 10, fill: colors.textSecondary },
                grid: { stroke: colors.border, strokeDasharray: '2,4' },
              }}
            />
            <VictoryLine
              data={pontos}
              interpolation="monotoneX"
              style={{ data: { stroke: colors.coral, strokeWidth: 2.5 } }}
            />
            <VictoryScatter data={pontos} size={3} style={{ data: { fill: colors.ink } }} />
          </VictoryChart>
        </Card>

        <Text style={styles.sectionTitle}>Picos registrados</Text>

        {picosFiltrados.length === 0 ? <EmptyState icon="chart-line" title="Nenhum pico registrado" message="Os alertas reais aparecerão aqui quando uma leitura válida ultrapassar os limites." /> : picosFiltrados.map((pico) => (
          <Card key={pico.id} style={styles.picoCard}>
            <View style={styles.picoIcon}>
              <MaterialCommunityIcons
                name={pico.tipo === 'batimento' ? 'heart-pulse' : 'thermometer'}
                size={20}
                color={pico.tipo === 'batimento' ? colors.ember : colors.amber}
              />
            </View>
            <View style={styles.picoInfo}>
              <Text style={styles.picoValor}>
                {pico.valor} {pico.tipo === 'batimento' ? 'bpm' : '°C'}
              </Text>
              <Text style={styles.picoHorario}>{pico.horario}</Text>
            </View>
          </Card>
        ))}
        </>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  chartCard: { marginBottom: 24, paddingBottom: 4 },
  chartHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 },
  chartLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  average: { fontFamily: fonts.display, fontSize: 28, color: colors.ink, marginTop: 3 },
  unit: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  range: { backgroundColor: colors.sand, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 6 },
  rangeText: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.ink, marginBottom: 12 },
  picoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, paddingVertical: 14 },
  picoIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  picoInfo: { flex: 1 },
  picoValor: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  picoHorario: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginTop: 2 },
});
