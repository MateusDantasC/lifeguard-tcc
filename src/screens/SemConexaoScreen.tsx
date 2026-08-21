import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/theme';
import BackHeader from '../components/BackHeader';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'SemConexao'>;

export default function SemConexaoScreen({ navigation }: Props) {
  const [retrying, setRetrying] = useState(false);

  function retry() {
    setRetrying(true);
    // TODO: substituir pela verificação real de rede e repetição da requisição anterior
    setTimeout(() => {
      setRetrying(false);
      navigation.goBack();
    }, 700);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="Sem conexão" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <EmptyState
          icon={retrying ? 'progress-clock' : 'wifi-off'}
          title={retrying ? 'Verificando conexão...' : 'Não foi possível atualizar'}
          message="Confira sua internet e tente novamente. Seus últimos dados continuam disponíveis no aplicativo."
          actionLabel={retrying ? undefined : 'Tentar novamente'}
          onAction={retrying ? undefined : retry}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, paddingBottom: 60 },
});
