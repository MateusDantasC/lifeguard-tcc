import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { colors, fonts } from '../theme/theme';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import PulseLine from '../components/PulseLine';
import SegmentedToggle from '../components/SegmentedToggle';
import InlineNotice from '../components/InlineNotice';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipoConta, setTipoConta] = useState<'idoso' | 'cuidador'>('idoso');
  const [erro, setErro] = useState('');
  const setUser = useAuthStore((state) => state.setUser);

  function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || !senha) {
      setErro('Digite um e-mail válido e sua senha.');
      return;
    }
    // TODO(temporário): trocar por chamada real ao backend (POST /login)
    setUser({
      id: '1',
      nome: tipoConta === 'idoso' ? 'Maria Silva' : 'Ana Pereira',
      email: normalizedEmail,
      telefone: tipoConta === 'idoso' ? '(11) 98888-1234' : '(11) 99999-0000',
      tipo: tipoConta,
    });
    setErro('');
    navigation.reset({ index: 0, routes: [{ name: tipoConta === 'idoso' ? 'HomeIdoso' : 'HomeCuidador' }] });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Text style={styles.titulo}>LifeGuard</Text>
            <Text style={styles.tagline}>Cuidado presente, mesmo à distância</Text>
            <PulseLine variant="divider" style={styles.pulse} />
          </View>

          <Text style={styles.sectionLabel}>Como você usa o LifeGuard?</Text>
          <SegmentedToggle
            value={tipoConta}
            onChange={setTipoConta}
            options={[
              { value: 'idoso', label: 'Sou idoso' },
              { value: 'cuidador', label: 'Sou cuidador' },
            ]}
          />

          <AppTextInput label="E-mail" value={email} onChangeText={(value) => { setEmail(value); setErro(''); }} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="nome@email.com" required />
          <AppTextInput label="Senha" value={senha} onChangeText={(value) => { setSenha(value); setErro(''); }} secureTextEntry autoComplete="password" placeholder="Sua senha" returnKeyType="done" onSubmitEditing={handleLogin} required />

          {erro ? <Text accessibilityRole="alert" style={styles.erro}>{erro}</Text> : null}

          <AppButton label="Entrar" icon="login" onPress={handleLogin} />
          <AppButton label="Esqueci minha senha" variant="text" onPress={() => navigation.navigate('RecuperarSenha')} style={styles.forgot} />
          <InlineNotice message="Protótipo: use qualquer e-mail válido e qualquer senha para entrar." />
          <View style={styles.createAccount}>
            <Text style={styles.createText}>Ainda não tem conta?</Text>
            <AppButton label="Criar conta" variant="text" onPress={() => navigation.navigate('Cadastro')} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  flex: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 36 },
  brand: { alignItems: 'center', marginBottom: 22 },
  titulo: { fontFamily: fonts.display, fontSize: 38, color: colors.ink, textAlign: 'center' },
  tagline: { fontFamily: fonts.body, fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: 5 },
  pulse: { alignSelf: 'center', marginTop: 12 },
  sectionLabel: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink, marginBottom: 8 },
  erro: { fontFamily: fonts.body, color: colors.emberText, marginBottom: 12, fontSize: 14 },
  forgot: { alignSelf: 'center', marginVertical: 4 },
  createAccount: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 },
  createText: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary },
});
