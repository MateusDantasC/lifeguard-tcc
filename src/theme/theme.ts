export const colors = {
  ink: '#1B3A3F',
  sand: '#F6F1E7',
  cardBg: '#FFFDF8',
  coral: '#E8734A',
  moss: '#4F7A5B',
  mossBg: '#E1EBDF',
  mossText: '#2F4F38',
  amber: '#D9A441',
  amberBg: '#FBF0DC',
  amberText: '#7A5A17',
  ember: '#C1443C',
  emberBg: '#F7DEDC',
  emberText: '#7A2A24',
  textPrimary: '#1B3A3F',
  textSecondary: '#5B6B6B',
  border: 'rgba(27,58,63,0.18)',
  borderStrong: 'rgba(27,58,63,0.25)',
};

export const fonts = {
  display: 'Fraunces_600SemiBold',
  body: 'AtkinsonHyperlegible_400Regular',
  bodyBold: 'AtkinsonHyperlegible_700Bold',
};

export const radii = { sm: 10, md: 14, lg: 20, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 14, lg: 20, xl: 28 };

export type StatusKey = 'normal' | 'atencao' | 'alerta';

export const statusConfig: Record<StatusKey, { bg: string; text: string; label: string }> = {
  normal: { bg: colors.mossBg, text: colors.mossText, label: 'Normal' },
  atencao: { bg: colors.amberBg, text: colors.amberText, label: 'Atenção' },
  alerta: { bg: colors.emberBg, text: colors.emberText, label: 'Alerta' },
};