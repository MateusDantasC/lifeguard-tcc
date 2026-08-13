import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts, radii } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import Card from '../../components/Card';
import AppButton from '../../components/AppButton';

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

  function handleParear() {
    // TODO: abrir fluxo real de pareamento (ler QR code ou digitar código do ESP32)
    Alert.alert('Parear dispositivo', 'Fluxo de pareamento ainda não implementado.');
  }

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

        <Card style={styles.infoCard}>
          <InfoRow label="Nome" value={dispositivoMock.nome} />
          <InfoRow label="Código do hardware" value={dispositivoMock.codigoHardware} />
          <InfoRow label="Última sincronização" value={dispositivoMock.ultimaSincronizacao} last />
        </Card>

        <AppButton label="Parear novo dispositivo" onPress={handleParear} style={{ marginTop: 8 }} />
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
  infoCard: { marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  infoValue: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
});