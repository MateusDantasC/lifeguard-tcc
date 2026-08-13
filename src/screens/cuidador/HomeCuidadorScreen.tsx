import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/authStore';
import { colors, fonts, radii } from '../../theme/theme';
import StatusPill from '../../components/StatusPill';

type Props = NativeStackScreenProps<RootStackParamList, 'HomeCuidador'>;

// TODO: substituir por dados reais (GET /idosos-vinculados/:cuidadorId)
const idososMock = [
  { id: '1', nome: 'Maria Silva', status: 'normal' as const, batimento: 76, temperatura: 36.4 },
  { id: '2', nome: 'José Oliveira', status: 'atencao' as const, batimento: 112, temperatura: 37.8 },
];

export default function HomeCuidadorScreen({}: Props) {
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.saudacao}>Olá, {user?.nome ?? 'Cuidador'}</Text>
          <Text style={styles.subSaudacao}>{idososMock.length} idoso(s) vinculado(s)</Text>
        </View>

        <Text style={styles.sectionTitle}>Meus idosos</Text>

        {idososMock.map((idoso) => (
          <Pressable key={idoso.id} style={styles.idosoCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLabel}>{idoso.nome.charAt(0)}</Text>
            </View>
            <View style={styles.idosoInfo}>
              <Text style={styles.idosoNome}>{idoso.nome}</Text>
              <Text style={styles.idosoLeitura}>{idoso.batimento} bpm · {idoso.temperatura}°C</Text>
            </View>
            <StatusPill status={idoso.status} />
          </Pressable>
        ))}
      </ScrollView>

      <Pressable style={styles.fab}>
        <MaterialCommunityIcons name="plus" size={20} color={colors.sand} />
        <Text style={styles.fabLabel}>Vincular idoso</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 20 },
  saudacao: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  subSaudacao: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink, marginBottom: 12 },
  idosoCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.cardBg, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { fontFamily: fonts.bodyBold, color: colors.sand, fontSize: 16 },
  idosoInfo: { flex: 1 },
  idosoNome: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  idosoLeitura: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  fab: { position: 'absolute', right: 16, bottom: 24, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.ink, borderRadius: radii.pill, paddingHorizontal: 20, height: 52 },
  fabLabel: { fontFamily: fonts.bodyBold, color: colors.sand, fontSize: 14 },
});