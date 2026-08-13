import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryScatter } from 'victory-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts, radii } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import SegmentedToggle from '../../components/SegmentedToggle';
import Card from '../../components/Card';

type Props = NativeStackScreenProps<RootStackParamList, 'Historico'>;

type Metrica = 'batimento' | 'temperatura';

// TODO: substituir por dados reais (GET /leituras/historico/:idosoId?periodo=24h)
function gerarPontosMock(metrica: Metrica) {
  const base = metrica === 'batimento' ? 76 : 36.4;
  const variacao = metrica === 'batimento' ? 18 : 0.6;
  return Array.from({ length: 12 }, (_, i) => ({
    x: i,
    y: Number((base + Math.sin(i / 1.5) * variacao + (i === 7 ? variacao * 1.8 : 0)).toFixed(1)),
  }));
}

// TODO: substituir por dados reais (GET /alertas/idoso/:idosoId)
const picosMock = [
  { id: '1', tipo: 'batimento' as const, valor: 128, horario: 'Hoje, 14:32' },
  { id: '2', tipo: 'temperatura' as const, valor: 38.1, horario: 'Ontem, 21:10' },
  { id: '3', tipo: 'batimento' as const, valor: 122, horario: 'Ontem, 09:47' },
];

export default function HistoricoScreen({ navigation, route }: Props) {
  const nomeIdoso = route.params?.nome;
  const [metrica, setMetrica] = useState<Metrica>('batimento');
  const pontos = useMemo(() => gerarPontosMock(metrica), [metrica]);
  const unidade = metrica === 'batimento' ? 'bpm' : '°C';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title={nomeIdoso ? `Histórico de ${nomeIdoso}` : 'Histórico'} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        <SegmentedToggle
          value={metrica}
          onChange={setMetrica}
          options={[
            { value: 'batimento', label: 'Batimento' },
            { value: 'temperatura', label: 'Temperatura' },
          ]}
        />

        <Card style={styles.chartCard}>
          <Text style={styles.chartLabel}>Últimas 24 horas</Text>
          <VictoryChart height={200} padding={{ top: 10, bottom: 30, left: 40, right: 20 }}>
            <VictoryAxis
              style={{
                axis: { stroke: colors.border },
                tickLabels: { fontFamily: fonts.body, fontSize: 10, fill: colors.textSecondary },
                grid: { stroke: 'transparent' },
              }}
              tickFormat={(t) => `${t}h`}
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

        {picosMock.map((pico) => (
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  chartCard: { marginBottom: 24, paddingBottom: 4 },
  chartLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink, marginBottom: 12 },
  picoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10, paddingVertical: 14 },
  picoIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  picoInfo: { flex: 1 },
  picoValor: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  picoHorario: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});