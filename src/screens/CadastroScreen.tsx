import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme/theme';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import SegmentedToggle from '../components/SegmentedToggle';
import BackHeader from '../components/BackHeader';
import InlineNotice from '../components/InlineNotice';

type Props = NativeStackScreenProps<RootStackParamList, 'Cadastro'>;

export default function CadastroScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipoConta, setTipoConta] = useState<'idoso' | 'cuidador'>('idoso');
  const [erro, setErro] = useState('');

  function handleCadastro() {
    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErro('Digite um e-mail válido.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }
    // TODO: substituir por chamada real ao backend (POST /cadastro)
    setErro('');
    Alert.alert('Conta criada', 'Seu cadastro foi simulado com sucesso. Agora você já pode entrar.', [
      { text: 'Continuar', onPress: () => navigation.navigate('Login') },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <BackHeader title="Criar conta" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Bem-vindo ao LifeGuard</Text>
        <Text style={styles.tagline}>Escolha seu tipo de conta e preencha seus dados.</Text>

        <SegmentedToggle
          value={tipoConta}
          onChange={setTipoConta}
          options={[
            { value: 'idoso', label: 'Idoso' },
            { value: 'cuidador', label: 'Cuidador' },
          ]}
        />

        <InlineNotice message={tipoConta === 'idoso' ? 'Você poderá acompanhar seus sinais e compartilhar o cuidado com pessoas de confiança.' : 'Você poderá acompanhar idosos vinculados e configurar os limites de alerta.'} />

        <View style={styles.fields}>
          <AppTextInput label="Nome completo" value={nome} onChangeText={(value) => { setNome(value); setErro(''); }} placeholder="Seu nome completo" autoComplete="name" required />
          <AppTextInput label="E-mail" value={email} onChangeText={(value) => { setEmail(value); setErro(''); }} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="nome@email.com" required />
          <AppTextInput label="Senha" value={senha} onChangeText={(value) => { setSenha(value); setErro(''); }} secureTextEntry autoComplete="new-password" placeholder="Pelo menos 6 caracteres" required />
          <AppTextInput label="Confirmar senha" value={confirmarSenha} onChangeText={(value) => { setConfirmarSenha(value); setErro(''); }} secureTextEntry placeholder="Repita sua senha" returnKeyType="done" onSubmitEditing={handleCadastro} required />
        </View>

        {erro ? <Text accessibilityRole="alert" style={styles.erro}>{erro}</Text> : null}

        <AppButton label="Criar minha conta" icon="account-plus-outline" onPress={handleCadastro} />
        <AppButton label="Já tenho conta" variant="text" onPress={() => navigation.navigate('Login')} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  titulo: { fontFamily: fonts.display, fontSize: 28, color: colors.ink, textAlign: 'center' },
  tagline: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22, color: colors.textSecondary, textAlign: 'center', marginTop: 6, marginBottom: 22 },
  fields: { marginTop: 20 },
  erro: { fontFamily: fonts.body, color: colors.emberText, marginBottom: 12, fontSize: 14 },
});
