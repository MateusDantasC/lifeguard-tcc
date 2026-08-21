import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts } from '../theme/theme';

type Props = {
  title: string;
  subtitle: string;
  onProfile: () => void;
  onNotifications?: () => void;
  notificationCount?: number;
};

export default function HomeHeader({ title, subtitle, onProfile, onNotifications, notificationCount = 0 }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.actions}>
        {onNotifications ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`Alertas${notificationCount ? `, ${notificationCount} novos` : ''}`} onPress={onNotifications} style={styles.action}>
            <MaterialCommunityIcons name="bell-outline" size={25} color={colors.ink} />
            {notificationCount > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{notificationCount}</Text></View> : null}
          </Pressable>
        ) : null}
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={onProfile} style={styles.profile}>
          <MaterialCommunityIcons name="account-outline" size={25} color={colors.sand} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  copy: { flex: 1 },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginTop: 3 },
  actions: { flexDirection: 'row', gap: 4 },
  action: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  profile: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', right: 3, top: 3, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.ember, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: colors.sand },
  badgeText: { color: colors.white, fontFamily: fonts.bodyBold, fontSize: 10 },
});
