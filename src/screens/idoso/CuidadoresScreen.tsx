import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts, radii } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import Card from '../../components/Card';
import AppButton from '../../components/AppButton';

type Props = NativeStackScreenProps<RootStackParamList, 'Cuidadores'>;

// TODO: substituir por dados reais (GET /vinculos/idoso/:idosoId)
const cuidadoresMock = [
  { id: '1', nome: 'Ana Pereira', vinculadoDesde: 'desde jan/2026' },
  { id: '2', nome: 'Carlos Souza', vinculadoDesde: 'desde mar/2026' },
];

export default function CuidadoresScreen({ navigation }: Props) {
  function handleGerarCodigo() {
    // TODO: gerar código real de vínculo no backend (POST /vinculos/gerar-codigo)
    Alert.alert('Código de vínculo', 'Seu código: 482913 (válido por 10 minutos)');
  }

  function handleRemover(nome: string) {
    // TODO: chamar backend pra remover o vínculo (DELETE /vinculos/:id)
    Alert.alert('Remover cuidador', `Remover ${nome} da sua lista de cuidadores?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => {} },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="Cuidadores" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        <AppButton label="Gerar código para novo cuidador" onPress={handleGerarCodigo} style={{ marginBottom: 24 }} />

        <Text style={styles.sectionTitle}>Vinculados a você</Text>

        {cuidadoresMock.map((cuidador) => (
          <Card key={cuidador.id} style={styles.cuidadorCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLabel}>{cuidador.nome.charAt(0)}</Text>
            </View>
            <View style={styles.cuidadorInfo}>
              <Text style={styles.cuidadorNome}>{cuidador.nome}</Text>
              <Text style={styles.cuidadorDesde}>{cuidador.vinculadoDesde}</Text>
            </View>
            <Pressable onPress={() => handleRemover(cuidador.nome)} hitSlop={10}>
              <MaterialCommunityIcons name="close-circle-outline" size={22} color={colors.ember} />
            </Pressable>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink, marginBottom: 12 },
  cuidadorCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { fontFamily: fonts.bodyBold, color: colors.sand, fontSize: 14 },
  cuidadorInfo: { flex: 1 },
  cuidadorNome: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  cuidadorDesde: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});