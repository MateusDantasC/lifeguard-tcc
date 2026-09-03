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
import { apiRequest, ApiError, getApiUrl, setApiUrl } from '../services/api';
import OptionCheckbox from '../components/OptionCheckbox';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [tipoConta, setTipoConta] = useState<'idoso' | 'cuidador'>('idoso');
  const [mostrarServidor, setMostrarServidor] = useState(false);
  const [servidor, setServidor] = useState(getApiUrl());
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [manterConectado, setManterConectado] = useState(true);
  const setSession = useAuthStore((state) => state.setSession);

  async function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || !senha) {
      setErro('Digite um e-mail válido e sua senha.');
      return;
    }
    if (!/^https?:\/\/\S+\/api$/.test(servidor.trim().replace(/\/+$/, ''))) {
      setErro('Confira o endereço da API. Exemplo: https://api.exemplo.com/api');
      setMostrarServidor(true);
      return;
    }
    setLoading(true);
    setApiUrl(servidor);
    try {
      const response = await apiRequest<{ token: string; usuario: NonNullable<ReturnType<typeof useAuthStore.getState>['user']> }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: normalizedEmail, senha }),
      });
      if (response.usuario.tipo !== tipoConta) {
        const tipoCorreto = response.usuario.tipo === 'idoso' ? 'paciente' : 'cuidador';
        setErro(`Esta conta é de ${tipoCorreto}. Selecione a opção correta acima.`);
        return;
      }
      setSession(response.token, response.usuario, manterConectado);
      setErro('');
      navigation.reset({ index: 0, routes: [{ name: response.usuario.tipo === 'idoso' ? 'HomeIdoso' : 'HomeCuidador' }] });
    } catch (error) {
      setErro(error instanceof ApiError ? error.message : 'Não foi possível entrar agora.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
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
              { value: 'idoso', label: 'Sou paciente' },
              { value: 'cuidador', label: 'Sou cuidador' },
            ]}
            disabled={loading}
          />

          <AppTextInput label="E-mail" value={email} onChangeText={(value) => { setEmail(value); setErro(''); }} editable={!loading} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="nome@email.com" required />
          <AppTextInput
            label="Senha"
            value={senha}
            onChangeText={(value) => { setSenha(value); setErro(''); }}
            editable={!loading}
            secureTextEntry={!mostrarSenha}
            rightIcon={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
            rightIconLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
            onRightIconPress={() => setMostrarSenha((value) => !value)}
            autoComplete="password"
            placeholder="Sua senha"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            required
          />

          <OptionCheckbox checked={manterConectado} label="Manter conectado neste aparelho" onChange={setManterConectado} disabled={loading} />

          {mostrarServidor ? (
            <AppTextInput
              label="Endereço da API (avançado)"
              value={servidor}
              onChangeText={(value) => { setServidor(value); setErro(''); }}
              editable={!loading}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              helperText="Altere somente para testes de desenvolvimento. O endereço deve terminar em /api."
            />
          ) : null}

          {erro ? <Text accessibilityRole="alert" style={styles.erro}>{erro}</Text> : null}

          <AppButton label="Entrar" icon="login" onPress={handleLogin} loading={loading} />
          <AppButton label={mostrarServidor ? 'Ocultar configuração avançada' : 'Configuração avançada'} variant="text" onPress={() => setMostrarServidor((value) => !value)} disabled={loading} style={styles.serverConfig} />
          <AppButton label="Esqueci minha senha" variant="text" onPress={() => navigation.navigate('RecuperarSenha')} disabled={loading} style={styles.forgot} />
          <InlineNotice message="Teste real: cuidador ana@lifeguard.test ou paciente maria@lifeguard.test. Senha: Teste123!" />
          <View style={styles.createAccount}>
            <Text style={styles.createText}>Ainda não tem conta?</Text>
            <AppButton label="Criar conta" variant="text" onPress={() => navigation.navigate('Cadastro')} disabled={loading} />
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
  serverConfig: { alignSelf: 'center', marginTop: 4 },
  createAccount: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 },
  createText: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary },
});
