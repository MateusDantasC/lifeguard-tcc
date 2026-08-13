import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import AppTextInput from '../../components/AppTextInput';
import AppButton from '../../components/AppButton';
import Card from '../../components/Card';

type Props = NativeStackScreenProps<RootStackParamList, 'ConfigurarLimites'>;

// TODO: carregar valores reais (GET /limites-alerta/:idosoId)
export default function ConfigurarLimitesScreen({ navigation, route }: Props) {
  const { idosoId, nome } = route.params;

  const [batimentoMin, setBatimentoMin] = useState('60');
  const [batimentoMax, setBatimentoMax] = useState('120');
  const [temperaturaMin, setTemperaturaMin] = useState('35.5');
  const [temperaturaMax, setTemperaturaMax] = useState('37.8');

  function handleSalvar() {
    // TODO: enviar pro backend (PUT /limites-alerta/:idosoId)
    Alert.alert('Limites salvos', `Novos limites de alerta definidos para ${nome}.`);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="Limites de alerta" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitulo}>Definindo para {nome}</Text>

        <Card style={styles.card}>
          <Text style={styles.grupoLabel}>Batimento cardíaco (bpm)</Text>
          <View style={styles.row}>
            <AppTextInput label="Mínimo" value={batimentoMin} onChangeText={setBatimentoMin} keyboardType="numeric" style={styles.metade} />
            <AppTextInput label="Máximo" value={batimentoMax} onChangeText={setBatimentoMax} keyboardType="numeric" style={styles.metade} />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.grupoLabel}>Temperatura (°C)</Text>
          <View style={styles.row}>
            <AppTextInput label="Mínima" value={temperaturaMin} onChangeText={setTemperaturaMin} keyboardType="numeric" style={styles.metade} />
            <AppTextInput label="Máxima" value={temperaturaMax} onChangeText={setTemperaturaMax} keyboardType="numeric" style={styles.metade} />
          </View>
        </Card>

        <AppButton label="Salvar limites" onPress={handleSalvar} style={{ marginTop: 8 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  subtitulo: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginBottom: 16 },
  card: { marginBottom: 16 },
  grupoLabel: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  metade: { flex: 1 },
});