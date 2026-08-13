import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuthStore } from '../store/authStore';
import { colors, fonts } from '../theme/theme';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import PulseLine from '../components/PulseLine';
import SegmentedToggle from '../components/SegmentedToggle';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipoConta, setTipoConta] = useState<'idoso' | 'cuidador'>('idoso');
  const [erro, setErro] = useState('');
  const setUser = useAuthStore((state) => state.setUser);

  function handleLogin() {
    if (!email || !senha) {
      setErro('Preencha email e senha.');
      return;
    }
    // TODO(temporário): trocar por chamada real ao backend (POST /login)
    setUser({ id: '1', nome: 'Usuário Teste', tipo: tipoConta });
    setErro('');
    navigation.reset({ index: 0, routes: [{ name: tipoConta === 'idoso' ? 'HomeIdoso' : 'HomeCuidador' }] });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.titulo}>LifeGuard</Text>
        <Text style={styles.tagline}>Cuidando de quem cuida</Text>
        <PulseLine variant="divider" style={styles.pulse} />

        <SegmentedToggle
          value={tipoConta}
          onChange={setTipoConta}
          options={[
            { value: 'idoso', label: 'Sou idoso' },
            { value: 'cuidador', label: 'Sou cuidador' },
          ]}
        />

        <AppTextInput label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="nome@email.com" />
        <AppTextInput label="Senha" value={senha} onChangeText={setSenha} secureTextEntry placeholder="••••••••" />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <AppButton label="Entrar" onPress={handleLogin} style={{ marginTop: 4 }} />
        <AppButton label="Esqueci minha senha" variant="text" onPress={() => {}} style={{ marginTop: 16 }} />
        <AppButton label="Ainda não tem conta? Criar conta" variant="text" onPress={() => navigation.navigate('Cadastro')} style={{ marginTop: 8 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  titulo: { fontFamily: fonts.display, fontSize: 32, color: colors.ink, textAlign: 'center' },
  tagline: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 2, marginBottom: 18 },
  pulse: { alignSelf: 'center', marginBottom: 24 },
  erro: { fontFamily: fonts.body, color: colors.ember, marginBottom: 8, fontSize: 13 },
});