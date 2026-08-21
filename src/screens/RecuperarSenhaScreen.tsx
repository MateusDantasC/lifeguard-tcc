import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme/theme';
import BackHeader from '../components/BackHeader';
import AppTextInput from '../components/AppTextInput';
import AppButton from '../components/AppButton';
import InlineNotice from '../components/InlineNotice';

type Props = NativeStackScreenProps<RootStackParamList, 'RecuperarSenha'>;

export default function RecuperarSenhaScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  function handleSend() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError('Digite um e-mail válido.');
      return;
    }
    // TODO: substituir pela recuperação real (POST /auth/recuperar-senha)
    setError('');
    setSent(true);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="Recuperar senha" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.intro}>
            <Text style={styles.title}>{sent ? 'Confira seu e-mail' : 'Vamos recuperar seu acesso'}</Text>
            <Text style={styles.description}>
              {sent ? `Enviamos as instruções para ${email.trim()}.` : 'Informe o e-mail cadastrado para receber as instruções de redefinição.'}
            </Text>
          </View>

          {sent ? (
            <>
              <InlineNotice tone="success" message="No protótipo, o envio foi simulado com sucesso. A entrega real será ligada ao backend." />
              <AppButton label="Voltar para entrar" onPress={() => navigation.navigate('Login')} style={styles.button} />
              <AppButton label="Usar outro e-mail" variant="text" onPress={() => setSent(false)} />
            </>
          ) : (
            <>
              <AppTextInput
                label="E-mail"
                value={email}
                onChangeText={(value) => { setEmail(value); setError(''); }}
                error={error}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="nome@email.com"
                returnKeyType="send"
                onSubmitEditing={handleSend}
                required
              />
              <AppButton label="Enviar instruções" icon="email-outline" onPress={handleSend} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40, justifyContent: 'center' },
  intro: { marginBottom: 28 },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.ink, textAlign: 'center' },
  description: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.textSecondary, textAlign: 'center', marginTop: 10 },
  button: { marginTop: 22 },
});
