import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import InlineNotice from '../../components/InlineNotice';

type Props = NativeStackScreenProps<RootStackParamList, 'ParearDispositivo'>;

export default function ParearDispositivoScreen({ navigation }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  function handlePair() {
    const normalized = code.trim().toUpperCase();
    if (normalized.length < 6) {
      setError('O código deve ter pelo menos 6 caracteres.');
      return;
    }
    // TODO: validar e parear o hardware real (POST /dispositivos/parear)
    Alert.alert('Dispositivo pareado', 'O pareamento foi simulado com sucesso neste protótipo.', [
      { text: 'Concluir', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="Parear dispositivo" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}><MaterialCommunityIcons name="devices" size={42} color={colors.coral} /><Text style={styles.title}>Conecte seu LifeGuard</Text><Text style={styles.description}>Digite o código impresso no dispositivo ou fornecido durante a configuração.</Text></View>
          <AppTextInput label="Código do dispositivo" value={code} onChangeText={(value) => { setCode(value.toUpperCase()); setError(''); }} error={error} placeholder="Ex.: A1B2C3D4" autoCapitalize="characters" maxLength={16} required />
          <AppButton label="Parear agora" icon="link-variant" onPress={handlePair} />
          <InlineNotice message="A leitura por QR code será ativada junto com a câmera e o cadastro real do hardware." tone="warning" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  flex: { flex: 1 },
  container: { paddingHorizontal: 20, paddingBottom: 40, gap: 20 },
  hero: { alignItems: 'center', paddingVertical: 18 },
  title: { fontFamily: fonts.display, fontSize: 25, color: colors.ink, marginTop: 12 },
  description: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.textSecondary, textAlign: 'center', marginTop: 8, maxWidth: 330 },
});
