import { useState } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme/theme';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import SegmentedToggle from '../components/SegmentedToggle';

type Props = NativeStackScreenProps<RootStackParamList, 'Cadastro'>;

export default function CadastroScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipoConta, setTipoConta] = useState<'idoso' | 'cuidador'>('idoso');
  const [erro, setErro] = useState('');

  function handleCadastro() {
    if (!nome || !email || !senha || !confirmarSenha) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }
    // TODO: substituir por chamada real ao backend (POST /cadastro)
    setErro('');
    navigation.navigate('Login');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>Criar conta</Text>
        <Text style={styles.tagline}>Leva menos de um minuto</Text>

        <SegmentedToggle
          value={tipoConta}
          onChange={setTipoConta}
          options={[
            { value: 'idoso', label: 'Idoso' },
            { value: 'cuidador', label: 'Cuidador' },
          ]}
        />

        <AppTextInput label="Nome" value={nome} onChangeText={setNome} placeholder="Seu nome completo" />
        <AppTextInput label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="nome@email.com" />
        <AppTextInput label="Senha" value={senha} onChangeText={setSenha} secureTextEntry placeholder="••••••••" />
        <AppTextInput label="Confirmar senha" value={confirmarSenha} onChangeText={setConfirmarSenha} secureTextEntry placeholder="••••••••" />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <AppButton label="Cadastrar" onPress={handleCadastro} style={{ marginTop: 4 }} />
        <AppButton label="Já tenho conta" variant="text" onPress={() => navigation.navigate('Login')} style={{ marginTop: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  titulo: { fontFamily: fonts.display, fontSize: 26, color: colors.ink, textAlign: 'center' },
  tagline: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 2, marginBottom: 20 },
  erro: { fontFamily: fonts.body, color: colors.ember, marginBottom: 8, fontSize: 13 },
});