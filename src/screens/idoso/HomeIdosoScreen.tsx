import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { colors, fonts, radii } from '../../theme/theme';
import VitalCard from '../../components/VitalCard';
import StatusPill from '../../components/StatusPill';

type Props = NativeStackScreenProps<RootStackParamList, 'HomeIdoso'>;

// TODO: substituir por dados reais (GET /leituras/atual/:idosoId)
const leituraMock = { batimento: 78, temperatura: 36.5, status: 'normal' as const, ultimaAtualizacao: 'há 2 minutos' };

const acessos = [
  { icon: 'chart-line' as const, label: 'Histórico', onPress: () => navigation.navigate('Historico') },
  { icon: 'devices' as const, label: 'Meu dispositivo', onPress: () => {} },
  { icon: 'account-group' as const, label: 'Cuidadores', onPress: () => {} },
  { icon: 'cog' as const, label: 'Config. de alerta', onPress: () => {} },
];

export default function HomeIdosoScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.saudacao}>Olá, {user?.nome ?? 'Usuário'}</Text>
            <Text style={styles.subSaudacao}>Atualizado {leituraMock.ultimaAtualizacao}</Text>
          </View>
          <StatusPill status={leituraMock.status} />
        </View>

        <View style={styles.readingsRow}>
          <VitalCard icon="heart-pulse" iconColor={colors.ember} value={leituraMock.batimento} unit="bpm" label="Batimento" showPulse />
          <VitalCard icon="thermometer" iconColor={colors.amber} value={leituraMock.temperatura} unit="°C" label="Temperatura" />
        </View>

        <Text style={styles.sectionTitle}>Acesso rápido</Text>
        <View style={styles.grid}>
          {acessos.map((item) => (
            <Pressable key={item.label} style={styles.gridItem} onPress={item.onPress}>
                <MaterialCommunityIcons name={item.icon} size={26} color={colors.ink} />
                <Text style={styles.gridLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.sos}>
          <MaterialCommunityIcons name="alert-octagon-outline" size={24} color={colors.sand} />
          <Text style={styles.sosLabel}>Emergência (SOS)</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  saudacao: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  subSaudacao: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  readingsRow: { flexDirection: 'row', gap: 12, marginBottom: 26 },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 26 },
  gridItem: { width: '47%', backgroundColor: colors.cardBg, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, paddingVertical: 18, alignItems: 'center', gap: 8 },
  gridLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.textPrimary, textAlign: 'center' },
  sos: { flexDirection: 'row', backgroundColor: colors.ember, borderRadius: radii.lg, height: 56, alignItems: 'center', justifyContent: 'center', gap: 8 },
  sosLabel: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.sand },
});