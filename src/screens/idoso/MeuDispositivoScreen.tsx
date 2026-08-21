import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import Card from '../../components/Card';
import AppButton from '../../components/AppButton';
import InlineNotice from '../../components/InlineNotice';

type Props = NativeStackScreenProps<RootStackParamList, 'MeuDispositivo'>;

// TODO: substituir por dados reais (GET /dispositivos/:idosoId)
const dispositivoMock = {
  conectado: true,
  nome: 'ESP32 - Pulseira',
  codigoHardware: 'A1B2C3D4E5F6',
  ultimaSincronizacao: 'há 40 segundos',
};

export default function MeuDispositivoScreen({ navigation }: Props) {
  const { conectado } = dispositivoMock;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="Meu dispositivo" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: conectado ? colors.moss : colors.ember }]} />
            <Text style={styles.statusLabel}>{conectado ? 'Conectado' : 'Desconectado'}</Text>
          </View>
          <MaterialCommunityIcons
            name={conectado ? 'wifi' : 'wifi-off'}
            size={22}
            color={conectado ? colors.moss : colors.ember}
          />
        </Card>

        <InlineNotice tone={conectado ? 'success' : 'danger'} message={conectado ? 'Seu dispositivo está enviando leituras normalmente.' : 'As leituras podem estar desatualizadas. Verifique o dispositivo.'} />

        <Card style={styles.infoCard}>
          <InfoRow label="Nome" value={dispositivoMock.nome} />
          <InfoRow label="Código do hardware" value={dispositivoMock.codigoHardware} />
          <InfoRow label="Última sincronização" value={dispositivoMock.ultimaSincronizacao} last />
        </Card>

        <AppButton label="Parear novo dispositivo" icon="link-variant" variant="secondary" onPress={() => navigation.navigate('ParearDispositivo')} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  statusCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  infoCard: { marginVertical: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  infoValue: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink, textAlign: 'right' },
});
