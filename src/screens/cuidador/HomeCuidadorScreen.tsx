import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { colors, fonts, radii } from '../../theme/theme';
import StatusPill from '../../components/StatusPill';
import HomeHeader from '../../components/HomeHeader';
import SectionHeader from '../../components/SectionHeader';
import { useMonitoringStore } from '../../store/monitoringStore';

type Props = NativeStackScreenProps<RootStackParamList, 'HomeCuidador'>;

export default function HomeCuidadorScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  // TODO: substituir por dados reais (GET /idosos-vinculados/:cuidadorId)
  const idosos = useMonitoringStore((state) => state.elders);
  const alertCount = useMonitoringStore((state) => state.alerts.filter((alert) => alert.status === 'novo').length);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <HomeHeader
          title={`Olá, ${(user?.nome ?? 'Cuidador').split(' ')[0]}`}
          subtitle={`${idosos.length} pessoas sob seus cuidados`}
          onProfile={() => navigation.navigate('Perfil')}
          onNotifications={() => navigation.navigate('Alertas')}
          notificationCount={alertCount}
        />

        <SectionHeader title="Pessoas acompanhadas" actionLabel="Ver alertas" onAction={() => navigation.navigate('Alertas')} />

        {idosos.map((idoso) => (
          <Pressable
            key={idoso.id}
            accessibilityRole="button"
            accessibilityLabel={`${idoso.nome}, status ${idoso.status}, ${idoso.batimento} batimentos por minuto, ${idoso.temperatura} graus`}
            style={({ pressed }) => [styles.idosoCard, pressed && styles.pressed]}
            onPress={() => navigation.navigate('DetalheIdoso', { idosoId: idoso.id, nome: idoso.nome })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarLabel}>{idoso.nome.charAt(0)}</Text>
            </View>
            <View style={styles.idosoInfo}>
              <Text style={styles.idosoNome}>{idoso.nome}</Text>
              <Text style={styles.idosoLeitura}>{idoso.batimento} bpm · {idoso.temperatura}°C</Text>
            </View>
            <StatusPill status={idoso.status} />
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </Pressable>
        ))}
      </ScrollView>

      <Pressable accessibilityRole="button" accessibilityLabel="Vincular idoso" style={({ pressed }) => [styles.fab, pressed && styles.pressed]} onPress={() => navigation.navigate('VincularIdoso')}>
        <MaterialCommunityIcons name="plus" size={20} color={colors.sand} />
        <Text style={styles.fabLabel}>Vincular idoso</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { padding: 20, paddingBottom: 100 },
  idosoCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.cardBg, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12, minHeight: 82 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { fontFamily: fonts.bodyBold, color: colors.sand, fontSize: 16 },
  idosoInfo: { flex: 1 },
  idosoNome: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  idosoLeitura: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginTop: 3 },
  fab: { position: 'absolute', right: 16, bottom: 24, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.ink, borderRadius: radii.pill, paddingHorizontal: 20, height: 52 },
  fabLabel: { fontFamily: fonts.bodyBold, color: colors.sand, fontSize: 14 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});
