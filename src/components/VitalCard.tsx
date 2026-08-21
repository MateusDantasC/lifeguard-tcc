import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Card from './Card';
import PulseLine from './PulseLine';
import { colors, fonts } from '../theme/theme';

type Props = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  value: string | number;
  unit: string;
  label: string;
  showPulse?: boolean;
};

export default function VitalCard({ icon, iconColor, value, unit, label, showPulse }: Props) {
  return (
    <Card style={styles.card}>
      {showPulse && (
        <View style={styles.pulseBg} pointerEvents="none">
          <PulseLine variant="background" animated />
        </View>
      )}
      <MaterialCommunityIcons name={icon} size={28} color={iconColor} />
      <Text accessibilityLabel={`${label}: ${value} ${unit}`} style={styles.value}>
        {value} <Text style={styles.unit}>{unit}</Text>
      </Text>
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, alignItems: 'flex-start', overflow: 'hidden' },
  pulseBg: { position: 'absolute', bottom: 10, left: -10 },
  value: { fontFamily: fonts.display, fontSize: 34, color: colors.ink, marginTop: 8 },
  unit: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  label: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginTop: 2 },
});
