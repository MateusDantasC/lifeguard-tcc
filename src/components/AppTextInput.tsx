import { useState } from 'react';
import { View, TextInput, Text, StyleSheet, StyleProp, TextInputProps, ViewStyle } from 'react-native';
import { colors, fonts, radii } from '../theme/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function AppTextInput({ label, style, error, helperText, required, containerStyle, onFocus, onBlur, ...rest }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={styles.label}>{label}{required ? ' *' : ''}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error ?? helperText}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.coral}
        style={[styles.input, focused && styles.inputFocused, error && styles.inputError, style]}
        onFocus={(event) => { setFocused(true); onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); onBlur?.(event); }}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.textPrimary, marginBottom: 7 },
  input: {
    minHeight: 54, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.borderStrong,
    backgroundColor: colors.cardBg, paddingHorizontal: 16, fontFamily: fonts.body, fontSize: 16, color: colors.textPrimary,
  },
  inputFocused: { borderColor: colors.ink },
  inputError: { borderColor: colors.ember },
  helper: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 6 },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.emberText, marginTop: 6 },
});
