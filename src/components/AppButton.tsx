import { ActivityIndicator, Pressable, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts, radii, touchTarget } from '../theme/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text' | 'danger';
  style?: StyleProp<ViewStyle>;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
};

export default function AppButton({
  label,
  onPress,
  variant = 'primary',
  style,
  icon,
  disabled = false,
  loading = false,
  accessibilityHint,
}: Props) {
  const isDisabled = disabled || loading;
  const isText = variant === 'text';
  const iconColor = isText ? colors.coral : variant === 'secondary' ? colors.ink : colors.sand;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      hitSlop={isText ? 8 : undefined}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <>
          {icon ? <MaterialCommunityIcons name={icon} size={21} color={iconColor} /> : null}
          <Text style={[styles.label, styles[`${variant}Label`]]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 18,
  },
  primary: { backgroundColor: colors.ink },
  secondary: { backgroundColor: colors.cardBg, borderWidth: 1.5, borderColor: colors.ink },
  danger: { backgroundColor: colors.ember },
  text: { minHeight: touchTarget, backgroundColor: colors.transparent, paddingHorizontal: 8 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.55 },
  label: { fontFamily: fonts.bodyBold, fontSize: 16, textAlign: 'center' },
  primaryLabel: { color: colors.sand },
  secondaryLabel: { color: colors.ink },
  dangerLabel: { color: colors.sand },
  textLabel: { color: colors.coral, fontSize: 15 },
});
