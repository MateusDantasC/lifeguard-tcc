import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, radii } from '../theme/theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'text';
  style?: ViewStyle;
};

export default function AppButton({ label, onPress, variant = 'primary', style }: Props) {
  if (variant === 'text') {
    return (
      <Pressable onPress={onPress} style={style} hitSlop={8}>
        <Text style={styles.textLabel}>{label}</Text>
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primary, style, pressed && { opacity: 0.85 }]}>
      <Text style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: { height: 56, borderRadius: radii.md, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  primaryLabel: { color: colors.sand, fontFamily: fonts.bodyBold, fontSize: 16 },
  textLabel: { color: colors.coral, fontFamily: fonts.body, fontSize: 13, textAlign: 'center' },
});