import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import BackHeader from '../components/BackHeader';
import Card from '../components/Card';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import PasswordRequirements from '../components/PasswordRequirements';
import InlineNotice from '../components/InlineNotice';
import { apiRequest, ApiError } from '../services/api';
import { isStrongPassword, passwordValidationMessage } from '../utils/validation';
import { useAuthStore } from '../store/authStore';
import { useMonitoringStore } from '../store/monitoringStore';
import { unregisterPushNotifications } from '../services/notifications';
import { colors, fonts } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ContaSeguranca'>;

export default function ContaSegurancaScreen({ navigation }: Props) {
  const logout = useAuthStore((state) => state.logout);
  const resetMonitoring = useMonitoringStore((state) => state.reset);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenhas, setMostrarSenhas] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [senhaExclusao, setSenhaExclusao] = useState('');
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function changePassword() {
    if (!senhaAtual) { setPasswordError('Informe sua senha atual.'); return; }
    if (!isStrongPassword(novaSenha)) { setPasswordError(passwordValidationMessage(novaSenha) ?? 'Escolha uma senha mais segura.'); return; }
    if (novaSenha !== confirmarSenha) { setPasswordError('A confirmação não corresponde à nova senha.'); return; }
    setChangingPassword(true); setPasswordError('');
    try {
      await apiRequest('/auth/senha', { method: 'PATCH', body: JSON.stringify({ senhaAtual, novaSenha }) });
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
      Alert.alert('Senha alterada', 'Sua nova senha já pode ser usada nos próximos acessos.');
    } catch (error) {
      setPasswordError(error instanceof ApiError ? error.message : 'Não foi possível alterar sua senha.');
    } finally { setChangingPassword(false); }
  }

  function confirmDelete() {
    if (!senhaExclusao) { setDeleteError('Informe sua senha atual.'); return; }
    if (confirmacaoExclusao.trim().toUpperCase() !== 'EXCLUIR') { setDeleteError('Digite EXCLUIR para confirmar.'); return; }
    Alert.alert(
      'Excluir conta definitivamente?',
      'O perfil, os vínculos e os dados associados serão removidos. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir conta', style: 'destructive', onPress: () => void deleteAccount() },
      ],
    );
  }

  async function deleteAccount() {
    setDeleting(true); setDeleteError('');
    try {
      await apiRequest('/auth/me', { method: 'DELETE', body: JSON.stringify({ senha: senhaExclusao }) });
      await unregisterPushNotifications().catch(() => undefined);
      logout(); resetMonitoring();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
      Alert.alert('Conta excluída', 'Seus dados foram removidos do LifeGuard.');
    } catch (error) {
      setDeleteError(error instanceof ApiError ? error.message : 'Não foi possível excluir sua conta.');
    } finally { setDeleting(false); }
  }

  const busy = changingPassword || deleting;
  const passwordIcon = mostrarSenhas ? 'eye-off-outline' : 'eye-outline';
  const passwordIconLabel = mostrarSenhas ? 'Ocultar senhas' : 'Mostrar senhas';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="Conta e segurança" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <Text style={styles.sectionTitle}>Alterar senha</Text>
          <Text style={styles.helper}>Use uma senha exclusiva que você não utiliza em outros serviços.</Text>
          <Card style={styles.card}>
            <AppTextInput label="Senha atual" value={senhaAtual} onChangeText={(value) => { setSenhaAtual(value); setPasswordError(''); }} secureTextEntry={!mostrarSenhas} autoCapitalize="none" autoComplete="current-password" editable={!busy} maxLength={72} rightIcon={passwordIcon} rightIconLabel={passwordIconLabel} onRightIconPress={() => setMostrarSenhas((value) => !value)} required />
            <AppTextInput label="Nova senha" value={novaSenha} onChangeText={(value) => { setNovaSenha(value); setPasswordError(''); }} secureTextEntry={!mostrarSenhas} autoCapitalize="none" autoComplete="new-password" editable={!busy} maxLength={72} rightIcon={passwordIcon} rightIconLabel={passwordIconLabel} onRightIconPress={() => setMostrarSenhas((value) => !value)} required />
            <PasswordRequirements password={novaSenha} />
            <AppTextInput label="Confirmar nova senha" value={confirmarSenha} onChangeText={(value) => { setConfirmarSenha(value); setPasswordError(''); }} secureTextEntry={!mostrarSenhas} autoCapitalize="none" autoComplete="new-password" editable={!busy} maxLength={72} required />
            {passwordError ? <Text accessibilityRole="alert" style={styles.error}>{passwordError}</Text> : null}
            <AppButton label="Alterar senha" icon="lock-reset" onPress={() => void changePassword()} loading={changingPassword} disabled={busy} />
          </Card>

          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Excluir conta</Text>
          <Text style={styles.helper}>Esta ação remove definitivamente o perfil e os dados relacionados.</Text>
          <Card style={styles.card}>
            <InlineNotice tone="danger" message="A exclusão é permanente. Vínculos, leituras e alertas associados também podem ser removidos." />
            <AppTextInput label="Senha atual" value={senhaExclusao} onChangeText={(value) => { setSenhaExclusao(value); setDeleteError(''); }} secureTextEntry autoCapitalize="none" autoComplete="current-password" editable={!busy} maxLength={72} containerStyle={styles.firstDeleteField} required />
            <AppTextInput label="Digite EXCLUIR" value={confirmacaoExclusao} onChangeText={(value) => { setConfirmacaoExclusao(value); setDeleteError(''); }} autoCapitalize="characters" autoCorrect={false} editable={!busy} maxLength={7} required />
            {deleteError ? <Text accessibilityRole="alert" style={styles.error}>{deleteError}</Text> : null}
            <AppButton label="Excluir minha conta" icon="delete-forever-outline" variant="danger" onPress={confirmDelete} loading={deleting} disabled={busy} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand }, flex: { flex: 1 }, container: { paddingHorizontal: 20, paddingBottom: 44 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginTop: 8 },
  dangerTitle: { color: colors.emberText, marginTop: 12 },
  helper: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textSecondary, marginTop: 4, marginBottom: 12 },
  card: { marginBottom: 22 }, error: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.emberText, marginBottom: 14 },
  firstDeleteField: { marginTop: 16 },
});
