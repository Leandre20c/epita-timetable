// components/Screen.tsx
import { ActivityIndicator, Text, View } from 'react-native';
import { useNetworkStatus } from '../hook/useNetworkStatus';
import { COLORS, screenStyles } from '../styles/screenStyles';
import { OfflineBanner } from './OfflineBanner';

type ScreenProps = {
  children?: React.ReactNode;
  isRefreshing?: boolean;
  loadingText?: string;
  isAuthenticated?: boolean | null;
  showNetworkBanner?: boolean;
};

export const Screen: React.FC<ScreenProps> = ({
  children,
  isRefreshing = false,
  loadingText = 'Chargement...',
  isAuthenticated = true,
  showNetworkBanner = true,
}) => {
  const { isOnline } = useNetworkStatus();

  // État d'authentification en cours
  if (isAuthenticated === null) {
    return (
      <View style={screenStyles.container}>
        <View style={screenStyles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={screenStyles.loadingText}>Vérification...</Text>
        </View>
      </View>
    );
  }

  // Non authentifié
  if (!isAuthenticated) {
    return (
      <View style={screenStyles.container}>
        <View style={screenStyles.emptyContainer}>
          <Text style={screenStyles.emptyIcon}>🔐</Text>
          <Text style={screenStyles.emptyTitle}>Non connecté</Text>
          <Text style={screenStyles.emptySubtitle}>
            Connectez-vous pour accéder à votre emploi du temps
          </Text>
        </View>
      </View>
    );
  }

  // Loading
  if (isRefreshing) {
    return (
      <View style={screenStyles.container}>
        <View style={screenStyles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={screenStyles.loadingText}>{loadingText}</Text>
        </View>
      </View>
    );
  }

  // Contenu normal
  return (
    <View style={screenStyles.container}>
      {showNetworkBanner && !isOnline && <OfflineBanner />}
      {children}
    </View>
  );
};