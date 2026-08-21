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
import { useMonitoringStore } from '../../store/monitoringStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ConfigurarLimites'>;

// TODO: carregar valores reais (GET /limites-alerta/:idosoId)
export default function ConfigurarLimitesScreen({ navigation, route }: Props) {
  const { idosoId, nome } = route.params;
  const savedLimits = useMonitoringStore((state) => state.limitsByElder[idosoId]);
  const updateLimits = useMonitoringStore((state) => state.updateLimits);

  const [batimentoMin, setBatimentoMin] = useState(String(savedLimits?.batimentoMin ?? 60));
  const [batimentoMax, setBatimentoMax] = useState(String(savedLimits?.batimentoMax ?? 120));
  const [temperaturaMin, setTemperaturaMin] = useState(String(savedLimits?.temperaturaMin ?? 35.5));
  const [temperaturaMax, setTemperaturaMax] = useState(String(savedLimits?.temperaturaMax ?? 37.8));
  const [erro, setErro] = useState('');

  function handleSalvar() {
    const values = [batimentoMin, batimentoMax, temperaturaMin, temperaturaMax].map((value) => Number(value.replace(',', '.')));
    if (values.some((value) => !Number.isFinite(value))) {
      setErro('Preencha todos os limites com números válidos.');
      return;
    }
    if (values[0] >= values[1] || values[2] >= values[3]) {
      setErro('O valor mínimo precisa ser menor que o máximo.');
      return;
    }
    // TODO: enviar pro backend (PUT /limites-alerta/:idosoId)
    setErro('');
    updateLimits(idosoId, { batimentoMin: values[0], batimentoMax: values[1], temperaturaMin: values[2], temperaturaMax: values[3] });
    Alert.alert('Limites salvos', `Novos limites de alerta definidos para ${nome}.`);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="Limites de alerta" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subtitulo}>Definindo os alertas de {nome}</Text>

        <Card style={styles.card}>
          <Text style={styles.grupoLabel}>Batimento cardíaco (bpm)</Text>
          <View style={styles.row}>
            <AppTextInput label="Mínimo" value={batimentoMin} onChangeText={(value) => { setBatimentoMin(value); setErro(''); }} keyboardType="decimal-pad" containerStyle={styles.field} />
            <AppTextInput label="Máximo" value={batimentoMax} onChangeText={(value) => { setBatimentoMax(value); setErro(''); }} keyboardType="decimal-pad" containerStyle={styles.field} />
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.grupoLabel}>Temperatura (°C)</Text>
          <View style={styles.row}>
            <AppTextInput label="Mínima" value={temperaturaMin} onChangeText={(value) => { setTemperaturaMin(value); setErro(''); }} keyboardType="decimal-pad" containerStyle={styles.field} />
            <AppTextInput label="Máxima" value={temperaturaMax} onChangeText={(value) => { setTemperaturaMax(value); setErro(''); }} keyboardType="decimal-pad" containerStyle={styles.field} />
          </View>
        </Card>

        {erro ? <Text accessibilityRole="alert" style={styles.erro}>{erro}</Text> : null}
        <AppButton label="Salvar limites" icon="content-save-outline" onPress={handleSalvar} style={styles.save} />
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
  field: { flex: 1 },
  erro: { fontFamily: fonts.body, fontSize: 14, color: colors.emberText, marginBottom: 12 },
  save: { marginTop: 4 },
});
