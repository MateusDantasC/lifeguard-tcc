import { PaperProvider } from 'react-native-paper';
import { theme } from './src/theme/theme';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
    </PaperProvider>
  );
}