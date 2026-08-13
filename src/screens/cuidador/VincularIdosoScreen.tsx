import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';

type Props = NativeStackScreenProps<RootStackParamList, 'VincularIdoso'>;

export default function VincularIdosoScreen({ navigation }: Props) {
  const [codigo, setCodigo] = useState('');

  function handleVincular() {
    if (!codigo) {
      Alert.alert('Digite o código', 'Peça o código de vínculo pro idoso que você cuida.');
      return;
    }
    // TODO: validar o código no backend (POST /vinculos/confirmar)
    Alert.alert('Vinculado!', 'Idoso adicionado à sua lista.');
    navigation.goBack();
  }

  function handleQrCode() {
    // TODO: abrir câmera e ler QR code de pareamento (expo-camera / expo-barcode-scanner)
    Alert.alert('Em breve', 'Leitura de QR code ainda não implementada.');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="Vincular idoso" onBack={() => navigation.goBack()} />

      <View style={styles.container}>
        <Text style={styles.instrucao}>
          Peça pro idoso gerar um código na tela "Cuidadores" do app dele, e digite abaixo.
        </Text>

        <AppTextInput
          label="Código de vínculo"
          value={codigo}
          onChangeText={setCodigo}
          keyboardType="numeric"
          placeholder="000000"
        />

        <AppButton label="Vincular" onPress={handleVincular} style={{ marginTop: 8, marginBottom: 20 }} />

        <View style={styles.divider}>
          <View style={styles.linha} />
          <Text style={styles.ou}>ou</Text>
          <View style={styles.linha} />
        </View>

        <AppButton
          label="Escanear QR code"
          variant="text"
          onPress={handleQrCode}
          style={{ marginTop: 20 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { paddingHorizontal: 20, paddingTop: 8 },
  instrucao: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginBottom: 20, lineHeight: 19 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  linha: { flex: 1, height: 1, backgroundColor: colors.border },
  ou: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
});