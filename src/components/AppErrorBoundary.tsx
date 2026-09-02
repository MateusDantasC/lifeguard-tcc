import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppButton from './AppButton';
import { colors, fonts } from '../theme/theme';

type Props = { children: ReactNode };
type State = { failed: boolean };

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('LifeGuard UI error', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={styles.safe}>
        <View style={styles.mark}>
          <MaterialCommunityIcons name="heart-pulse" size={34} color={colors.coral} />
        </View>
        <Text style={styles.kicker}>LIFEGUARD</Text>
        <Text style={styles.title}>Algo saiu do ritmo</Text>
        <Text style={styles.message}>Não foi possível exibir esta tela. Tente novamente; se o problema continuar, feche e abra o aplicativo.</Text>
        <AppButton label="Tentar novamente" icon="refresh" onPress={() => this.setState({ failed: false })} style={styles.button} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 28, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  mark: { width: 74, height: 74, borderRadius: 24, backgroundColor: colors.coralSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  kicker: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.8, color: colors.coral },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.ink, textAlign: 'center', marginTop: 7 },
  message: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.textSecondary, textAlign: 'center', marginTop: 10, maxWidth: 360 },
  button: { alignSelf: 'stretch', marginTop: 24 },
});
