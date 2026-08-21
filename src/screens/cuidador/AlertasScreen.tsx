import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts, radii } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import Card from '../../components/Card';
import SegmentedToggle from '../../components/SegmentedToggle';
import EmptyState from '../../components/EmptyState';
import { useMonitoringStore, type AlertStatus } from '../../store/monitoringStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Alertas'>;
const STATUS_LABEL: Record<AlertStatus, string> = { novo: 'Novo', visto: 'Visto', resolvido: 'Resolvido' };

export default function AlertasScreen({ navigation }: Props) {
  // TODO: substituir por dados reais (GET /alertas/cuidador/:cuidadorId)
  const alertas = useMonitoringStore((state) => state.alerts);
  const updateAlertStatus = useMonitoringStore((state) => state.updateAlertStatus);
  const [filtro, setFiltro] = useState<'pendentes' | 'resolvidos'>('pendentes');
  const filtrados = alertas.filter((alerta) => filtro === 'pendentes' ? alerta.status !== 'resolvido' : alerta.status === 'resolvido');

  function marcarResolvido(id: string) {
    // TODO: chamar backend (PATCH /alertas/:id) pra persistir
    updateAlertStatus(id, 'resolvido');
  }

  function marcarVisto(id: string) {
    // TODO: persistir leitura do alerta (PATCH /alertas/:id/visto)
    updateAlertStatus(id, 'visto');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="Alertas" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.intro}>Acompanhe ocorrências fora dos limites definidos e registre quando estiverem resolvidas.</Text>
        <SegmentedToggle value={filtro} onChange={setFiltro} options={[{ value: 'pendentes', label: `Pendentes (${alertas.filter((item) => item.status !== 'resolvido').length})` }, { value: 'resolvidos', label: 'Resolvidos' }]} />

        {filtrados.length === 0 ? <EmptyState icon="bell-check-outline" title="Tudo resolvido" message="Não há alertas nesta categoria." /> : filtrados.map((alerta) => (
          <Card key={alerta.id} style={styles.card}>
            <View style={styles.rowTop}>
              <View style={styles.icon}>
                <MaterialCommunityIcons
                  name={alerta.tipo === 'batimento' ? 'heart-pulse' : 'thermometer'}
                  size={20}
                  color={alerta.tipo === 'batimento' ? colors.ember : colors.amber}
                />
              </View>
              <View style={styles.info}>
                <Text style={styles.idosoNome}>{alerta.idosoNome}</Text>
                <Text style={styles.detalhe}>
                  {alerta.valor} {alerta.tipo === 'batimento' ? 'bpm' : '°C'} · {alerta.horario}
                </Text>
              </View>
              <View style={[styles.statusTag, alerta.status === 'novo' && styles.statusNovo, alerta.status === 'resolvido' && styles.statusResolvido]}>
                <Text style={[styles.statusTagLabel, alerta.status === 'novo' && styles.statusTagLabelNovo, alerta.status === 'resolvido' && styles.statusTagLabelResolvido]}>
                  {STATUS_LABEL[alerta.status]}
                </Text>
              </View>
            </View>

            {alerta.status !== 'resolvido' && (
              <View style={styles.actions}>
                {alerta.status === 'novo' ? <Pressable accessibilityRole="button" onPress={() => marcarVisto(alerta.id)} style={styles.actionBtn}><Text style={styles.secondaryAction}>Marcar como visto</Text></Pressable> : null}
                <Pressable accessibilityRole="button" onPress={() => marcarResolvido(alerta.id)} style={styles.actionBtn}><Text style={styles.resolverLabel}>Resolver alerta</Text></Pressable>
              </View>
            )}
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('DetalheIdoso', { idosoId: alerta.idosoId, nome: alerta.idosoNome })} style={styles.personLink}><Text style={styles.personLinkText}>Ver monitoramento de {alerta.idosoNome.split(' ')[0]}</Text><MaterialCommunityIcons name="chevron-right" size={20} color={colors.coral} /></Pressable>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  intro: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.textSecondary, marginBottom: 16 },
  card: { marginBottom: 12 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  idosoNome: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  detalhe: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  statusTag: { backgroundColor: colors.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  statusNovo: { backgroundColor: colors.emberBg },
  statusResolvido: { backgroundColor: colors.mossBg },
  statusTagLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.textSecondary },
  statusTagLabelNovo: { color: colors.emberText ?? colors.ember },
  statusTagLabelResolvido: { color: colors.mossText },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  actionBtn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  secondaryAction: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.textSecondary },
  resolverLabel: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.coral },
  personLink: { minHeight: 48, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  personLinkText: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14, color: colors.coral },
});
