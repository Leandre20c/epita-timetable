// components/CalendarHeader.tsx
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../styles/screenStyles';

type CalendarHeaderProps = {
  title: string;
  subtitle: string;
  isToday: boolean;
  onPress: () => void;
};

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  title,
  subtitle,
  isToday,
  onPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, isToday && styles.todayContainer]}>
      {/* Padding dynamique selon la hauteur de l'encoche */}
      <View style={{ paddingTop: insets.top }}>
        <TouchableOpacity
          style={styles.content}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.title, isToday && styles.todayTitle]}>
            {title}
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
    elevation: 5,
    zIndex: 10,
  },
  todayContainer: {
    backgroundColor: '#f0f8ff',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.light.text.primary,
    textTransform: 'capitalize',
  },
  todayTitle: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.light.text.secondary,
    marginTop: 4,
  },
});