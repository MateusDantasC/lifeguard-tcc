import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../theme/theme';

type Option<T extends string> = { value: T; label: string };
type Props<T extends string> = { value: T; onChange: (value: T) => void; options: Option<T>[] };

export default function SegmentedToggle<T extends string>({ value, onChange, options }: Props<T>) {
  return (
    <View style={styles.wrapper}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable key={opt.value} onPress={() => onChange(opt.value)} style={[styles.option, active && styles.optionActive]}>
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', backgroundColor: colors.cardBg, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: 4, marginBottom: 18 },
  option: { flex: 1, paddingVertical: 10, borderRadius: radii.sm, alignItems: 'center' },
  optionActive: { backgroundColor: colors.ink },
  label: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  labelActive: { fontFamily: fonts.bodyBold, color: colors.sand },
});