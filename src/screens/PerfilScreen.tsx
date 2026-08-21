import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { colors, fonts } from '../theme/theme';
import BackHeader from '../components/BackHeader';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import Card from '../components/Card';

type Props = NativeStackScreenProps<RootStackParamList, 'Perfil'>;

export default function PerfilScreen({ navigation }: Props) {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(user?.nome ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [telefone, setTelefone] = useState(user?.telefone ?? '(11) 99999-0000');
  const [error, setError] = useState('');

  function handleSave() {
    if (!nome.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Confira seu nome e e-mail antes de salvar.');
      return;
    }
    // TODO: persistir as alterações (PATCH /usuarios/:id)
    updateUser({ nome: nome.trim(), email: email.trim().toLowerCase(), telefone: telefone.trim() });
    setError('');
    setEditing(false);
    Alert.alert('Perfil atualizado', 'Suas informações foram salvas neste protótipo.');
  }

  function handleLogout() {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader
        title="Meu perfil"
        onBack={() => navigation.goBack()}
        rightIcon={editing ? undefined : 'pencil-outline'}
        onRightPress={editing ? undefined : () => setEditing(true)}
        rightLabel="Editar perfil"
      />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user?.nome ?? 'U').charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.name}>{user?.nome ?? 'Usuário'}</Text>
            <View style={styles.accountType}>
              <MaterialCommunityIcons name={user?.tipo === 'cuidador' ? 'hand-heart-outline' : 'account-heart-outline'} size={17} color={colors.mossText} />
              <Text style={styles.accountTypeText}>Conta de {user?.tipo ?? 'usuário'}</Text>
            </View>
          </View>

          <Card style={styles.card}>
            {editing ? (
              <>
                <AppTextInput label="Nome completo" value={nome} onChangeText={setNome} required />
                <AppTextInput label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" required />
                <AppTextInput label="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
                {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
                <AppButton label="Salvar alterações" icon="content-save-outline" onPress={handleSave} />
                <AppButton label="Cancelar" variant="text" onPress={() => { setEditing(false); setError(''); }} />
              </>
            ) : (
              <>
                <ProfileRow icon="email-outline" label="E-mail" value={user?.email ?? 'usuario@exemplo.com'} />
                <ProfileRow icon="phone-outline" label="Telefone" value={user?.telefone ?? '(11) 99999-0000'} last />
              </>
            )}
          </Card>

          {!editing ? <AppButton label="Sair da conta" icon="logout" variant="secondary" onPress={handleLogout} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ProfileRow({ icon, label, value, last }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowIcon}><MaterialCommunityIcons name={icon} size={21} color={colors.coral} /></View>
      <View style={styles.rowCopy}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  flex: { flex: 1 },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  identity: { alignItems: 'center', paddingVertical: 12, marginBottom: 20 },
  avatar: { width: 82, height: 82, borderRadius: 41, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontFamily: fonts.display, fontSize: 34, color: colors.sand },
  name: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  accountType: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: colors.mossBg, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8 },
  accountTypeText: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.mossText },
  card: { marginBottom: 18 },
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.coralSoft, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1 },
  rowLabel: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  rowValue: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink, marginTop: 2 },
  error: { fontFamily: fonts.body, fontSize: 14, color: colors.emberText, marginBottom: 14 },
});
