import { View, Text, StyleSheet } from 'react-native';
import { fonts, radii, statusConfig, StatusKey } from '../theme/theme';

export default function StatusPill({ status }: { status: StatusKey }) {
  const info = statusConfig[status];
  return (
    <View accessible accessibilityLabel={`Status: ${info.label}`} style={[styles.pill, { backgroundColor: info.bg }]}>
      <Text style={[styles.label, { color: info.text }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { minHeight: 30, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radii.pill, alignSelf: 'flex-start', justifyContent: 'center' },
  label: { fontFamily: fonts.bodyBold, fontSize: 12 },
});
