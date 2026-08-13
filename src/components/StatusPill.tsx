import { View, Text, StyleSheet } from 'react-native';
import { fonts, radii, statusConfig, StatusKey } from '../theme/theme';

export default function StatusPill({ status }: { status: StatusKey }) {
  const info = statusConfig[status];
  return (
    <View style={[styles.pill, { backgroundColor: info.bg }]}>
      <Text style={[styles.label, { color: info.text }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: radii.pill, alignSelf: 'flex-start' },
  label: { fontFamily: fonts.bodyBold, fontSize: 11 },
});