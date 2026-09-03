import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import InlineNotice from '../../components/InlineNotice';
import { useMonitoringStore } from '../../store/monitoringStore';
import { apiRequest, ApiError } from '../../services/api';
import { fetchCaregiverDashboard } from '../../services/monitoring';

type Props = NativeStackScreenProps<RootStackParamList, 'VincularIdoso'>;

export default function VincularIdosoScreen({ navigation }: Props) {
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const setElders = useMonitoringStore((state) => state.setElders);
  const setAlerts = useMonitoringStore((state) => state.setAlerts);
  const [loading, setLoading] = useState(false);

  async function handleVincular() {
    if (!/^\d{6}$/.test(codigo)) {
      setErro('Digite os 6 números do código de vínculo.');
      return;
    }
    setLoading(true);
    try {
      const response = await apiRequest<{ vinculo: { usuario: { nome: string } } }>('/vinculos', { method: 'POST', body: JSON.stringify({ codigo }) });
      const dashboard = await fetchCaregiverDashboard();
      setElders(dashboard.elders);
      setAlerts(dashboard.alerts);
      setErro('');
      Alert.alert('Vínculo concluído', `${response.vinculo.usuario.nome} foi adicionado à sua lista.`, [
        { text: 'Continuar', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : 'Não foi possível concluir o vínculo.');
    } finally {
      setLoading(false);
    }
  }

  function handleQrCode() {
    // TODO: abrir câmera e ler QR code de pareamento (expo-camera / expo-barcode-scanner)
    Alert.alert('Câmera necessária', 'O QR code será ativado quando o cadastro real dos dispositivos for integrado. Por enquanto, use o código de 6 números.');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="Vincular paciente" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <View style={styles.hero}>
          <View style={styles.icon}><MaterialCommunityIcons name="account-heart-outline" size={34} color={colors.coral} /></View>
          <Text style={styles.title}>Adicione alguém aos seus cuidados</Text>
          <Text style={styles.instrucao}>Peça ao paciente para gerar um código na tela “Cuidadores” e digite-o abaixo.</Text>
        </View>

        <AppTextInput
          label="Código de vínculo"
          value={codigo}
          onChangeText={(value) => { setCodigo(value.replace(/\D/g, '').slice(0, 6)); setErro(''); }}
          keyboardType="numeric"
          placeholder="000000"
          error={erro}
          maxLength={6}
          returnKeyType="done"
          onSubmitEditing={handleVincular}
          required
        />

        <AppButton label="Confirmar vínculo" icon="link-variant" onPress={handleVincular} loading={loading} />

        <View style={styles.divider}>
          <View style={styles.linha} />
          <Text style={styles.ou}>ou</Text>
          <View style={styles.linha} />
        </View>

        <AppButton
          label="Escanear QR code"
          icon="qrcode-scan"
          variant="secondary"
          onPress={handleQrCode}
        />
        <InlineNotice tone="warning" message="O código expira em 15 minutos e só deve ser usado com autorização do paciente." />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  flex: { flex: 1 },
  container: { paddingHorizontal: 20, paddingBottom: 40, gap: 18 },
  hero: { alignItems: 'center' },
  icon: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.coralSoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.ink, textAlign: 'center', marginTop: 14 },
  instrucao: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 },
  linha: { flex: 1, height: 1, backgroundColor: colors.border },
  ou: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
});
