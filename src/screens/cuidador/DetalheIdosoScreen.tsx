import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import VitalCard from '../../components/VitalCard';
import StatusPill from '../../components/StatusPill';
import AppButton from '../../components/AppButton';
import Card from '../../components/Card';
import { useMonitoringStore } from '../../store/monitoringStore';
import { useFocusEffect } from '@react-navigation/native';
import { fetchElder } from '../../services/monitoring';
import { ApiError } from '../../services/api';
import InlineNotice from '../../components/InlineNotice';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalheIdoso'>;

export default function DetalheIdosoScreen({ navigation, route }: Props) {
  const { idosoId, nome } = route.params;
  const elder = useMonitoringStore((state) => state.elders.find((item) => item.id === idosoId));
  const upsertElder = useMonitoringStore((state) => state.upsertElder);
  const setLimits = useMonitoringStore((state) => state.setLimits);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState('');
  const leitura = elder ?? { id: idosoId, nome, batimento: null, temperatura: null, status: 'sem_sinal' as const, ultimaAtualizacao: 'indisponível', telefone: '' };

  const refresh = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const result = await fetchElder(idosoId);
      upsertElder(result.elder);
      if (result.limits) setLimits(idosoId, result.limits);
      setErro('');
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : 'Não foi possível atualizar os dados.');
    } finally {
      setRefreshing(false);
    }
  }, [idosoId, setLimits, upsertElder]);

  useFocusEffect(useCallback(() => {
    void refresh(true);
    const interval = setInterval(() => void refresh(), 5_000);
    return () => clearInterval(interval);
  }, [refresh]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title={nome} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refresh(true)} tintColor={colors.coral} />}>
        {erro ? <InlineNotice tone="warning" message={erro} /> : null}
        <Card style={styles.header}>
          <View style={styles.statusCopy}><Text style={styles.statusTitle}>Monitoramento ativo</Text><Text style={styles.subSaudacao}>Atualizado {leitura.ultimaAtualizacao}</Text></View>
          <StatusPill status={leitura.status} />
        </Card>

        <View style={styles.readingsRow}>
          <VitalCard icon="heart-pulse" iconColor={colors.ember} value={leitura.batimento ?? '--'} unit="bpm" label="Batimento" showPulse />
          <VitalCard icon="thermometer" iconColor={colors.amber} value={leitura.temperatura ?? '--'} unit="°C" label="Temperatura" />
        </View>

        <AppButton
          label="Ver histórico completo"
          icon="chart-line"
          onPress={() => navigation.navigate('Historico', { idosoId, nome })}
          style={{ marginBottom: 12 }}
        />
        <AppButton
          label="Configurar limites de alerta"
          icon="tune-variant"
          variant="secondary"
          onPress={() => navigation.navigate('ConfigurarLimites', { idosoId, nome })}
          style={styles.action}
        />
        <AppButton label={`Falar com ${nome.split(' ')[0]}`} icon="phone-outline" variant="text" onPress={() => navigation.navigate('ContatoRapido', { idosoId, nome, telefone: leitura.telefone })} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, paddingVertical: 16 },
  statusCopy: { flex: 1 },
  statusTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  subSaudacao: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginTop: 3 },
  readingsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  action: { marginTop: 12 },
});
