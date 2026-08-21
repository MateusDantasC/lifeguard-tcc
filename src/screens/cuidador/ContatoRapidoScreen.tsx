import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, fonts } from '../../theme/theme';
import BackHeader from '../../components/BackHeader';
import Card from '../../components/Card';
import AppButton from '../../components/AppButton';
import InlineNotice from '../../components/InlineNotice';

type Props = NativeStackScreenProps<RootStackParamList, 'ContatoRapido'>;

export default function ContatoRapidoScreen({ navigation, route }: Props) {
  const { nome, telefone } = route.params;

  async function openUrl(url: string, unavailableMessage: string) {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Ação indisponível', unavailableMessage);
      return;
    }
    await Linking.openURL(url);
  }

  function call() {
    Alert.alert(`Ligar para ${nome}?`, telefone, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Ligar', onPress: () => openUrl(`tel:${telefone.replace(/\D/g, '')}`, 'Este aparelho não pode iniciar ligações.') },
    ]);
  }

  function message() {
    openUrl(`sms:${telefone.replace(/\D/g, '')}?body=${encodeURIComponent(`Olá, ${nome}. Está tudo bem?`)}`, 'Este aparelho não pode enviar mensagens.');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="Contato rápido" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.identity}><View style={styles.avatar}><Text style={styles.avatarText}>{nome.charAt(0)}</Text></View><Text style={styles.name}>{nome}</Text><Text style={styles.phone}>{telefone}</Text></View>
        <Card style={styles.card}>
          <MaterialCommunityIcons name="phone-in-talk-outline" size={28} color={colors.coral} />
          <View style={styles.copy}><Text style={styles.cardTitle}>Falar agora</Text><Text style={styles.cardText}>Use uma ligação ou mensagem para verificar como {nome.split(' ')[0]} está.</Text></View>
        </Card>
        <AppButton label="Ligar" icon="phone-outline" onPress={call} />
        <AppButton label="Enviar mensagem" icon="message-text-outline" variant="secondary" onPress={message} />
        <InlineNotice tone="warning" message="Em uma emergência médica, ligue para o SAMU pelo número 192." />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand },
  container: { paddingHorizontal: 20, paddingBottom: 40, gap: 14 },
  identity: { alignItems: 'center', paddingVertical: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.display, color: colors.sand, fontSize: 32 },
  name: { fontFamily: fonts.display, fontSize: 25, color: colors.ink, marginTop: 12 },
  phone: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary, marginTop: 3 },
  card: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  copy: { flex: 1 },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  cardText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textSecondary, marginTop: 4 },
});
