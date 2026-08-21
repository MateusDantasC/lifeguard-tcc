import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import Card from '../../components/Card';
import AppButton from '../../components/AppButton';
import InlineNotice from '../../components/InlineNotice';
import { useMonitoringStore } from '../../store/monitoringStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Cuidadores'>;

export default function CuidadoresScreen({ navigation }: Props) {
  const [codigo, setCodigo] = useState<string | null>(null);
  // TODO: substituir por dados reais (GET /vinculos/idoso/:idosoId)
  const cuidadores = useMonitoringStore((state) => state.caregivers);
  const removeCaregiver = useMonitoringStore((state) => state.removeCaregiver);

  function handleGerarCodigo() {
    // TODO: gerar código real de vínculo no backend (POST /vinculos/gerar-codigo)
    setCodigo(String(Math.floor(100000 + Math.random() * 900000)));
  }

  function handleRemover(nome: string) {
    // TODO: chamar backend pra remover o vínculo (DELETE /vinculos/:id)
    Alert.alert('Remover cuidador', `Remover ${nome} da sua lista de cuidadores?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => {
        const caregiver = cuidadores.find((item) => item.nome === nome);
        if (caregiver) removeCaregiver(caregiver.id);
      } },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="Cuidadores" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        <InlineNotice message="Somente pessoas com um código válido podem se vincular à sua conta." />
        <AppButton label={codigo ? 'Gerar novo código' : 'Gerar código de vínculo'} icon="account-plus-outline" onPress={handleGerarCodigo} style={styles.generateButton} />

        {codigo ? (
          <Card style={styles.codeCard}>
            <Text style={styles.codeLabel}>Seu código temporário</Text>
            <Text accessibilityLabel={`Código ${codigo.split('').join(' ')}`} style={styles.code}>{codigo}</Text>
            <Text style={styles.codeHint}>Válido por 10 minutos · compartilhe apenas com alguém de confiança</Text>
          </Card>
        ) : null}

        <Text style={styles.sectionTitle}>Vinculados a você</Text>

        {cuidadores.length === 0 ? <Text style={styles.empty}>Nenhum cuidador vinculado no momento.</Text> : cuidadores.map((cuidador) => (
          <Card key={cuidador.id} style={styles.cuidadorCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLabel}>{cuidador.nome.charAt(0)}</Text>
            </View>
            <View style={styles.cuidadorInfo}>
              <Text style={styles.cuidadorNome}>{cuidador.nome}</Text>
              <Text style={styles.cuidadorDesde}>{cuidador.vinculadoDesde}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Remover ${cuidador.nome}`} onPress={() => handleRemover(cuidador.nome)} hitSlop={8} style={styles.removeButton}>
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
  generateButton: { marginTop: 14, marginBottom: 16 },
  codeCard: { alignItems: 'center', marginBottom: 24, backgroundColor: colors.coralSoft },
  codeLabel: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  code: { fontFamily: fonts.display, fontSize: 34, letterSpacing: 7, color: colors.ink, marginVertical: 8 },
  codeHint: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.textSecondary, textAlign: 'center' },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.ink, marginBottom: 12 },
  cuidadorCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { fontFamily: fonts.bodyBold, color: colors.sand, fontSize: 14 },
  cuidadorInfo: { flex: 1 },
  cuidadorNome: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  cuidadorDesde: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  removeButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  empty: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.textSecondary, textAlign: 'center', paddingVertical: 32 },
});
