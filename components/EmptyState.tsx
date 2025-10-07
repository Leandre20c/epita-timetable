import { Text, View } from 'react-native';
import { screenStyles } from '../styles/screenStyles';

type EmptyStateProps = {
  icon: string;
  title: string;
  subtitle: string;
};

// ✅ Export nommé
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle }) => (
  <View style={screenStyles.emptyContainer}>
    <Text style={screenStyles.emptyIcon}>{icon}</Text>
    <Text style={screenStyles.emptyTitle}>{title}</Text>
    <Text style={screenStyles.emptySubtitle}>{subtitle}</Text>
  </View>
);