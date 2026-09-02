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
import { formatPhone, phoneUri, whatsappUri } from '../../utils/phone';

type Props = NativeStackScreenProps<RootStackParamList, 'ContatoRapido'>;

export default function ContatoRapidoScreen({ navigation, route }: Props) {
  const { nome, telefone } = route.params;
  const formattedPhone = formatPhone(telefone) || 'Telefone não informado';

  async function openUrl(url: string, unavailableMessage: string) {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Ação indisponível', unavailableMessage);
      return;
    }
    await Linking.openURL(url);
  }

  function call() {
    const uri = phoneUri(telefone);
    if (!uri) { Alert.alert('Telefone indisponível', `${nome} ainda não possui um telefone válido.`); return; }
    Alert.alert(`Ligar para ${nome}?`, formattedPhone, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Ligar', onPress: () => openUrl(uri, 'Este aparelho não pode iniciar ligações.') },
    ]);
  }

  function message() {
    const uri = whatsappUri(telefone, `Olá, ${nome}. Está tudo bem?`);
    if (!uri) { Alert.alert('Telefone indisponível', `${nome} ainda não possui um telefone válido.`); return; }
    openUrl(uri, 'Não foi possível abrir o WhatsApp neste aparelho.');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <BackHeader title="Contato rápido" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.identity}><View style={styles.avatar}><Text style={styles.avatarText}>{nome.charAt(0)}</Text></View><Text style={styles.name}>{nome}</Text><Text style={styles.phone}>{formattedPhone}</Text></View>
        <Card style={styles.card}>
          <MaterialCommunityIcons name="phone-in-talk-outline" size={28} color={colors.coral} />
          <View style={styles.copy}><Text style={styles.cardTitle}>Falar agora</Text><Text style={styles.cardText}>Use uma ligação ou mensagem para verificar como {nome.split(' ')[0]} está.</Text></View>
        </Card>
        <AppButton label="Ligar" icon="phone-outline" onPress={call} />
        <AppButton label="Conversar no WhatsApp" icon="whatsapp" variant="secondary" onPress={message} />
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
