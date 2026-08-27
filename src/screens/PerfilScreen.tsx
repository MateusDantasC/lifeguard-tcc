import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuthStore, type ElderProfile } from '../store/authStore';
import { colors, fonts } from '../theme/theme';
import BackHeader from '../components/BackHeader';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import Card from '../components/Card';
import { apiRequest, ApiError } from '../services/api';
import { useMonitoringStore } from '../store/monitoringStore';
import { formatPhone } from '../utils/phone';

type Props = NativeStackScreenProps<RootStackParamList, 'Perfil'>;

function isoToBr(value?: string | null) {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}/${month}/${year}` : '';
}

function brToIso(value: string) {
  if (!value.trim()) return null;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return undefined;
  const [, day, month, year] = match;
  const date = new Date(`${year}-${month}-${day}T12:00:00.000Z`);
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() + 1 !== Number(month) || date.getUTCDate() !== Number(day)) return undefined;
  return `${year}-${month}-${day}`;
}

export default function PerfilScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);
  const resetMonitoring = useMonitoringStore((state) => state.reset);
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(user?.nome ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [telefone, setTelefone] = useState(formatPhone(user?.telefone));
  const [foto, setFoto] = useState<string | null>(user?.foto ?? null);
  const [dataNascimento, setDataNascimento] = useState(isoToBr(user?.perfilIdoso?.dataNascimento));
  const [tipoSanguineo, setTipoSanguineo] = useState(user?.perfilIdoso?.tipoSanguineo ?? '');
  const [alergias, setAlergias] = useState(user?.perfilIdoso?.alergias ?? '');
  const [medicamentos, setMedicamentos] = useState(user?.perfilIdoso?.medicamentos ?? '');
  const [condicoesMedicas, setCondicoesMedicas] = useState(user?.perfilIdoso?.condicoesMedicas ?? '');
  const [observacoes, setObservacoes] = useState(user?.perfilIdoso?.observacoesImportantes ?? '');
  const [contatoNome, setContatoNome] = useState(user?.perfilIdoso?.contatoEmergenciaNome ?? '');
  const [contatoTelefone, setContatoTelefone] = useState(formatPhone(user?.perfilIdoso?.contatoEmergenciaTelefone));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setNome(user?.nome ?? ''); setEmail(user?.email ?? ''); setTelefone(formatPhone(user?.telefone)); setFoto(user?.foto ?? null);
    setDataNascimento(isoToBr(user?.perfilIdoso?.dataNascimento)); setTipoSanguineo(user?.perfilIdoso?.tipoSanguineo ?? '');
    setAlergias(user?.perfilIdoso?.alergias ?? ''); setMedicamentos(user?.perfilIdoso?.medicamentos ?? '');
    setCondicoesMedicas(user?.perfilIdoso?.condicoesMedicas ?? ''); setObservacoes(user?.perfilIdoso?.observacoesImportantes ?? '');
    setContatoNome(user?.perfilIdoso?.contatoEmergenciaNome ?? ''); setContatoTelefone(formatPhone(user?.perfilIdoso?.contatoEmergenciaTelefone));
  }

  async function choosePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso às fotos para escolher uma imagem de perfil.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.85 });
    if (result.canceled) return;
    try {
      const context = ImageManipulator.manipulate(result.assets[0].uri);
      context.resize({ width: 512, height: null });
      const rendered = await context.renderAsync();
      const optimized = await rendered.saveAsync({ base64: true, compress: 0.72, format: SaveFormat.JPEG });
      if (!optimized.base64) throw new Error('Imagem sem conteúdo');
      setFoto(`data:image/jpeg;base64,${optimized.base64}`);
      setError('');
    } catch {
      setError('Não foi possível preparar esta foto. Escolha outra imagem.');
    }
  }

  async function handleSave() {
    if (!nome.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Confira seu nome e e-mail antes de salvar.'); return;
    }
    const birthDate = brToIso(dataNascimento);
    if (birthDate === undefined) {
      setError('Informe a data de nascimento no formato DD/MM/AAAA.'); return;
    }
    const perfilIdoso: ElderProfile | undefined = user?.tipo === 'idoso' ? {
      dataNascimento: birthDate,
      tipoSanguineo: tipoSanguineo.trim().toUpperCase() || null,
      alergias: alergias.trim() || null,
      medicamentos: medicamentos.trim() || null,
      condicoesMedicas: condicoesMedicas.trim() || null,
      observacoesImportantes: observacoes.trim() || null,
      contatoEmergenciaNome: contatoNome.trim() || null,
      contatoEmergenciaTelefone: contatoTelefone.trim() || null,
    } : undefined;
    setLoading(true);
    try {
      const response = await apiRequest<{ usuario: NonNullable<typeof user> }>('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ nome: nome.trim(), email: email.trim().toLowerCase(), telefone: telefone.trim() || null, foto, ...(perfilIdoso ? { perfilIdoso } : {}) }),
      });
      updateUser(response.usuario);
      setError(''); setEditing(false);
      Alert.alert('Perfil atualizado', 'Suas informações foram salvas.');
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Não foi possível salvar o perfil.');
    } finally { setLoading(false); }
  }

  function handleLogout() {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => { logout(); resetMonitoring(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); } },
    ]);
  }

  const profile = user?.perfilIdoso;
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="Meu perfil" onBack={() => navigation.goBack()} rightIcon={editing ? undefined : 'pencil-outline'} onRightPress={editing ? undefined : () => setEditing(true)} rightLabel="Editar perfil" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.identity}>
            <View style={styles.avatar}>{foto ? <Image source={{ uri: foto }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{(user?.nome ?? 'U').charAt(0).toUpperCase()}</Text>}</View>
            {editing ? <View style={styles.photoActions}>
              <AppButton label={foto ? 'Trocar foto' : 'Adicionar foto'} icon="image-outline" variant="text" onPress={() => void choosePhoto()} disabled={loading} />
              {foto ? <AppButton label="Remover" icon="delete-outline" variant="text" onPress={() => setFoto(null)} disabled={loading} /> : null}
            </View> : null}
            <Text style={styles.name}>{user?.nome ?? 'Usuário'}</Text>
            <View style={styles.accountType}><MaterialCommunityIcons name={user?.tipo === 'cuidador' ? 'hand-heart-outline' : 'account-heart-outline'} size={17} color={colors.mossText} /><Text style={styles.accountTypeText}>Conta de {user?.tipo ?? 'usuário'}</Text></View>
          </View>

          <Card style={styles.card}>{editing ? <>
            <AppTextInput label="Nome completo" value={nome} onChangeText={setNome} editable={!loading} required />
            <AppTextInput label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" editable={!loading} required />
            <AppTextInput label="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" editable={!loading} />
          </> : <>
            <ProfileRow icon="email-outline" label="E-mail" value={user?.email ?? 'Não informado'} />
            <ProfileRow icon="phone-outline" label="Telefone" value={formatPhone(user?.telefone) || 'Não informado'} last />
          </>}</Card>

          {user?.tipo === 'idoso' ? <>
            <Text style={styles.sectionTitle}>Informações importantes</Text>
            <Text style={styles.sectionHelper}>Esses dados ficam disponíveis somente para você e seus cuidadores vinculados.</Text>
            <Card style={styles.card}>{editing ? <>
              <View style={styles.inlineFields}>
                <AppTextInput label="Data de nascimento" value={dataNascimento} onChangeText={setDataNascimento} placeholder="DD/MM/AAAA" keyboardType="number-pad" editable={!loading} containerStyle={styles.flexField} />
                <AppTextInput label="Tipo sanguíneo" value={tipoSanguineo} onChangeText={setTipoSanguineo} placeholder="Ex.: O+" autoCapitalize="characters" editable={!loading} containerStyle={styles.bloodField} />
              </View>
              <AppTextInput label="Condições médicas" value={condicoesMedicas} onChangeText={setCondicoesMedicas} placeholder="Ex.: hipertensão, diabetes" multiline textAlignVertical="top" style={styles.multiline} editable={!loading} />
              <AppTextInput label="Alergias" value={alergias} onChangeText={setAlergias} placeholder="Medicamentos, alimentos ou outras" multiline textAlignVertical="top" style={styles.multiline} editable={!loading} />
              <AppTextInput label="Medicamentos em uso" value={medicamentos} onChangeText={setMedicamentos} placeholder="Nome e dosagem, se souber" multiline textAlignVertical="top" style={styles.multiline} editable={!loading} />
              <AppTextInput label="Observações importantes" value={observacoes} onChangeText={setObservacoes} placeholder="Informações úteis em uma emergência" multiline textAlignVertical="top" style={styles.multiline} editable={!loading} />
              <Text style={styles.subsectionTitle}>Contato de emergência</Text>
              <AppTextInput label="Nome" value={contatoNome} onChangeText={setContatoNome} editable={!loading} />
              <AppTextInput label="Telefone" value={contatoTelefone} onChangeText={setContatoTelefone} keyboardType="phone-pad" editable={!loading} />
            </> : <>
              <ProfileRow icon="calendar-outline" label="Data de nascimento" value={isoToBr(profile?.dataNascimento) || 'Não informado'} />
              <ProfileRow icon="water-outline" label="Tipo sanguíneo" value={profile?.tipoSanguineo || 'Não informado'} />
              <ProfileRow icon="medical-bag" label="Condições médicas" value={profile?.condicoesMedicas || 'Não informado'} />
              <ProfileRow icon="allergy" label="Alergias" value={profile?.alergias || 'Não informado'} />
              <ProfileRow icon="pill" label="Medicamentos em uso" value={profile?.medicamentos || 'Não informado'} />
              <ProfileRow icon="alert-circle-outline" label="Observações importantes" value={profile?.observacoesImportantes || 'Não informado'} />
              <ProfileRow icon="account-alert-outline" label="Contato de emergência" value={profile?.contatoEmergenciaNome && profile?.contatoEmergenciaTelefone ? `${profile.contatoEmergenciaNome} · ${formatPhone(profile.contatoEmergenciaTelefone)}` : 'Não informado'} last />
            </>}</Card>
          </> : null}

          {editing ? <>
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <AppButton label="Salvar alterações" icon="content-save-outline" onPress={handleSave} loading={loading} disabled={loading} />
            <AppButton label="Cancelar" variant="text" disabled={loading} onPress={() => { resetForm(); setEditing(false); setError(''); }} />
          </> : <AppButton label="Sair da conta" icon="logout" variant="secondary" onPress={handleLogout} />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ProfileRow({ icon, label, value, last }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: string; last?: boolean }) {
  return <View style={[styles.row, !last && styles.rowBorder]}><View style={styles.rowIcon}><MaterialCommunityIcons name={icon} size={21} color={colors.coral} /></View><View style={styles.rowCopy}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value}</Text></View></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand }, flex: { flex: 1 }, container: { paddingHorizontal: 20, paddingBottom: 40 },
  identity: { alignItems: 'center', paddingVertical: 12, marginBottom: 20 },
  avatar: { width: 92, height: 92, borderRadius: 46, overflow: 'hidden', backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  avatarImage: { width: '100%', height: '100%' }, avatarText: { fontFamily: fonts.display, fontSize: 36, color: colors.sand },
  photoActions: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 }, name: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  accountType: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: colors.mossBg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8 },
  accountTypeText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.mossText }, card: { marginBottom: 18 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 21, color: colors.ink, marginTop: 4 }, sectionHelper: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textSecondary, marginTop: 4, marginBottom: 12 },
  subsectionTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink, marginBottom: 12, marginTop: 2 }, inlineFields: { flexDirection: 'row', gap: 10 }, flexField: { flex: 1 }, bloodField: { width: 120 },
  multiline: { minHeight: 86, paddingTop: 14, paddingBottom: 14 }, row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border }, rowIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.coralSoft, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1 }, rowLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary }, rowValue: { fontFamily: fonts.bodyBold, fontSize: 15, lineHeight: 21, color: colors.ink, marginTop: 2 },
  error: { fontFamily: fonts.body, fontSize: 14, color: colors.emberText, marginBottom: 14 },
});
