import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import InlineNotice from '../../components/InlineNotice';
import Card from '../../components/Card';
import { apiRequest, ApiError, getApiUrl } from '../../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ParearDispositivo'>;
export default function ParearDispositivoScreen({ navigation }: Props) {
  const [name, setName] = useState('Meu ESP32');
  const [credential, setCredential] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function provision() {
    if (loading) return;
    setLoading(true); setError('');
    try {
      const result = await apiRequest<{ credencial: string }>('/dispositivos/provisionar', { method: 'POST', body: JSON.stringify({ nome: name.trim() }) });
      setCredential(result.credencial);
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Não foi possível preparar o dispositivo.'); }
    finally { setLoading(false); }
  }
  function confirm() {
    if (name.trim().length < 2) { setError('Informe um nome com pelo menos dois caracteres.'); return; }
    Alert.alert('Preparar dispositivo?', 'Isso revoga o dispositivo anterior. A credencial será exibida uma única vez para você inserir no firmware do seu ESP32.', [
      { text: 'Cancelar', style: 'cancel' }, { text: 'Preparar', onPress: () => void provision() },
    ]);
  }
  return <SafeAreaView style={styles.safe} edges={['top']}>
    <BackHeader title="Preparar ESP32" onBack={() => { if (!loading) navigation.goBack(); }} />
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <InlineNotice message="Esta etapa autoriza o envio ao servidor. Não conecta por Bluetooth nem grava o firmware automaticamente: a configuração inicial do ESP32 será feita no computador." />
        {credential ? <>
          <InlineNotice tone="warning" message="Guarde a credencial no arquivo local de configuração do firmware. Não envie por mensagem nem publique no GitHub. Ela não será mostrada novamente ao sair." />
          <Card><Text style={styles.label}>Credencial exclusiva</Text><Text selectable style={styles.secret}>{credential}</Text></Card>
          <Text selectable style={styles.text}>Destino HTTPS: {getApiUrl()}/dispositivos/leituras</Text>
          <Text style={styles.text}>No firmware: Authorization: Bearer seguido da credencial. O dispositivo só aparecerá conectado após enviar a primeira leitura.</Text>
          <AppButton label="Já guardei, concluir" onPress={() => navigation.goBack()} />
        </> : <>
          <AppTextInput label="Nome do dispositivo" value={name} onChangeText={setName} maxLength={60} editable={!loading} required />
          {error ? <InlineNotice tone="warning" message={error} /> : null}
          <AppButton label="Gerar credencial do ESP32" onPress={confirm} loading={loading} />
        </>}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand }, flex: { flex: 1 },
  container: { paddingHorizontal: 20, paddingBottom: 40, gap: 18 },
  label: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  secret: { fontFamily: fonts.body, fontSize: 13, color: colors.ink, marginTop: 12 },
  text: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textSecondary },
});
