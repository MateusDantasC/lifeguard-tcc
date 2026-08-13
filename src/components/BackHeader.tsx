import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts } from '../theme/theme';

type Props = {
  title: string;
  onBack: () => void;
};

export default function BackHeader({ title, onBack }: Props) {
  return (
    <View style={styles.wrapper}>
      <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
        <MaterialCommunityIcons name="arrow-left" size={24} color={colors.ink} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontFamily: fonts.display, fontSize: 20, color: colors.ink, textAlign: 'center' },
  spacer: { width: 40 },
});