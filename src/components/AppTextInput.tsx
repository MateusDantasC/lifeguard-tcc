import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors, fonts, radii } from '../theme/theme';

type Props = TextInputProps & { label: string };

export default function AppTextInput({ label, style, ...rest }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.textSecondary} style={[styles.input, style]} {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { fontFamily: fonts.body, fontSize: 13, color: colors.textPrimary, marginBottom: 6 },
  input: {
    height: 52, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.borderStrong,
    backgroundColor: colors.cardBg, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 15, color: colors.textPrimary,
  },
});