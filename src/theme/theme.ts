import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2E5A88',      // azul confiável/saúde
    error: '#C62828',        // vermelho pra alertas
  },
};