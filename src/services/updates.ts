import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

let checking = false;

export async function checkForAppUpdate() {
  if (__DEV__ || !Updates.isEnabled || checking) return;
  checking = true;
  try {
    const update = await Updates.checkForUpdateAsync();
    if (!update.isAvailable) return;
    await Updates.fetchUpdateAsync();
    Alert.alert(
      'Atualização pronta',
      'Uma nova versão do LifeGuard foi baixada. Deseja aplicá-la agora?',
      [
        { text: 'Depois', style: 'cancel' },
        { text: 'Atualizar agora', onPress: () => void Updates.reloadAsync() },
      ],
    );
  } catch {
    // A falta de rede não impede o uso da versão já instalada.
  } finally {
    checking = false;
  }
}
