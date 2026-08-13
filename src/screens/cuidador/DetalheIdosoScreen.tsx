import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import VitalCard from '../../components/VitalCard';
import StatusPill from '../../components/StatusPill';
import AppButton from '../../components/AppButton';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalheIdoso'>;

// TODO: substituir por dados reais (GET /leituras/atual/:idosoId)
const leituraMock = { batimento: 112, temperatura: 37.8, status: 'atencao' as const, ultimaAtualizacao: 'há 1 minuto' };

export default function DetalheIdosoScreen({ navigation, route }: Props) {
  const { idosoId, nome } = route.params;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title={nome} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.subSaudacao}>Atualizado {leituraMock.ultimaAtualizacao}</Text>
          <StatusPill status={leituraMock.status} />
        </View>

        <View style={styles.readingsRow}>
          <VitalCard icon="heart-pulse" iconColor={colors.ember} value={leituraMock.batimento} unit="bpm" label="Batimento" showPulse />
          <VitalCard icon="thermometer" iconColor={colors.amber} value={leituraMock.temperatura} unit="°C" label="Temperatura" />
        </View>

        <AppButton
          label="Ver histórico completo"
          onPress={() => navigation.navigate('Historico', { idosoId, nome })}
          style={{ marginBottom: 12 }}
        />
        <AppButton
          label="Configurar limites de alerta"
          variant="text"
          onPress={() => navigation.navigate('ConfigurarLimites', { idosoId, nome })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  subSaudacao: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  readingsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
});