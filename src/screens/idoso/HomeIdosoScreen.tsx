import { Alert, Linking, ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { colors, fonts, radii } from '../../theme/theme';
import VitalCard from '../../components/VitalCard';
import StatusPill from '../../components/StatusPill';
import HomeHeader from '../../components/HomeHeader';
import Card from '../../components/Card';
import SectionHeader from '../../components/SectionHeader';
import { useMonitoringStore } from '../../store/monitoringStore';

type Props = NativeStackScreenProps<RootStackParamList, 'HomeIdoso'>;

export default function HomeIdosoScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  // TODO: substituir por dados reais (GET /leituras/atual/:idosoId)
  const leitura = useMonitoringStore((state) => state.elders[0]);

  const acessos = [
    { icon: 'chart-line' as const, label: 'Histórico', onPress: () => navigation.navigate('Historico') },
    { icon: 'devices' as const, label: 'Meu dispositivo', onPress: () => navigation.navigate('MeuDispositivo') },
    { icon: 'account-group' as const, label: 'Cuidadores', onPress: () => navigation.navigate('Cuidadores') },
    { icon: 'tune-variant' as const, label: 'Limites de alerta', onPress: () => navigation.navigate('LimitesIdoso') },
  ];

  function handleSos() {
    Alert.alert('Emergência', 'Deseja ligar para o SAMU (192)?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Ligar 192', style: 'destructive', onPress: () => Linking.openURL('tel:192') },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <HomeHeader title={`Olá, ${(user?.nome ?? 'Usuário').split(' ')[0]}`} subtitle="Seu cuidado está sendo acompanhado" onProfile={() => navigation.navigate('Perfil')} />

        <Card style={styles.statusCard}>
          <View style={styles.statusCopy}><Text style={styles.statusTitle}>Tudo bem por aqui</Text><Text style={styles.statusSubtitle}>Dados atualizados {leitura.ultimaAtualizacao}</Text></View>
          <StatusPill status={leitura.status} />
        </Card>

        <View style={styles.readingsRow}>
          <VitalCard icon="heart-pulse" iconColor={colors.ember} value={leitura.batimento} unit="bpm" label="Batimento" showPulse />
          <VitalCard icon="thermometer" iconColor={colors.amber} value={leitura.temperatura} unit="°C" label="Temperatura" />
        </View>

        <SectionHeader title="Acesso rápido" />
        <View style={styles.grid}>
          {acessos.map((item) => (
            <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={item.label} style={({ pressed }) => [styles.gridItem, pressed && styles.pressed]} onPress={item.onPress}>
                <MaterialCommunityIcons name={item.icon} size={26} color={colors.ink} />
                <Text style={styles.gridLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="Emergência, ligar para o SAMU" style={({ pressed }) => [styles.sos, pressed && styles.pressed]} onPress={handleSos}>
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
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingVertical: 16 },
  statusCopy: { flex: 1 },
  statusTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  statusSubtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginTop: 3 },
  readingsRow: { flexDirection: 'row', gap: 12, marginBottom: 26 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  gridItem: { width: '47%', flexGrow: 1, minHeight: 112, backgroundColor: colors.cardBg, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 9 },
  gridLabel: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.textPrimary, textAlign: 'center' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  sos: { flexDirection: 'row', backgroundColor: colors.ember, borderRadius: radii.lg, minHeight: 60, alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 16 },
  sosLabel: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.sand },
});
