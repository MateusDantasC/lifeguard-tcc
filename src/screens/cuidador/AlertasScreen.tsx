import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts, radii } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import Card from '../../components/Card';

type Props = NativeStackScreenProps<RootStackParamList, 'Alertas'>;
type StatusAlerta = 'novo' | 'visto' | 'resolvido';

// TODO: substituir por dados reais (GET /alertas/cuidador/:cuidadorId)
const alertasMock = [
  { id: '1', idosoNome: 'José Oliveira', tipo: 'batimento' as const, valor: 128, horario: 'Hoje, 14:32', status: 'novo' as StatusAlerta },
  { id: '2', idosoNome: 'Maria Silva', tipo: 'temperatura' as const, valor: 38.2, horario: 'Ontem, 21:10', status: 'visto' as StatusAlerta },
  { id: '3', idosoNome: 'José Oliveira', tipo: 'batimento' as const, valor: 122, horario: 'Ontem, 09:47', status: 'resolvido' as StatusAlerta },
];

const STATUS_LABEL: Record<StatusAlerta, string> = { novo: 'Novo', visto: 'Visto', resolvido: 'Resolvido' };

export default function AlertasScreen({ navigation }: Props) {
  const [alertas, setAlertas] = useState(alertasMock);

  function marcarResolvido(id: string) {
    // TODO: chamar backend (PATCH /alertas/:id) pra persistir
    setAlertas((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'resolvido' } : a)));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="Alertas" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.container}>
        {alertas.map((alerta) => (
          <Card key={alerta.id} style={styles.card}>
            <View style={styles.rowTop}>
              <View style={styles.icon}>
                <MaterialCommunityIcons
                  name={alerta.tipo === 'batimento' ? 'heart-pulse' : 'thermometer'}
                  size={20}
                  color={alerta.tipo === 'batimento' ? colors.ember : colors.amber}
                />
              </View>
              <View style={styles.info}>
                <Text style={styles.idosoNome}>{alerta.idosoNome}</Text>
                <Text style={styles.detalhe}>
                  {alerta.valor} {alerta.tipo === 'batimento' ? 'bpm' : '°C'} · {alerta.horario}
                </Text>
              </View>
              <View style={[styles.statusTag, alerta.status === 'novo' && styles.statusNovo]}>
                <Text style={[styles.statusTagLabel, alerta.status === 'novo' && styles.statusTagLabelNovo]}>
                  {STATUS_LABEL[alerta.status]}
                </Text>
              </View>
            </View>

            {alerta.status !== 'resolvido' && (
              <Pressable onPress={() => marcarResolvido(alerta.id)} style={styles.resolverBtn}>
                <Text style={styles.resolverLabel}>Marcar como resolvido</Text>
              </Pressable>
            )}
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { marginBottom: 12 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  idosoNome: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  detalhe: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statusTag: { backgroundColor: colors.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  statusNovo: { backgroundColor: '#F7DEDC' },
  statusTagLabel: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.textSecondary },
  statusTagLabelNovo: { color: colors.emberText ?? colors.ember },
  resolverBtn: { marginTop: 12, alignSelf: 'flex-start' },
  resolverLabel: { fontFamily: fonts.body, fontSize: 12, color: colors.coral },
});