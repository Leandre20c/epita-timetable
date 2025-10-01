// app/(tabs)/profile.tsx

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthService } from '../../services/AuthService';
import { GroupService } from '../../services/GroupeService';
import { COLORS } from '../../styles/screenStyles';

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function ProfileScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{
    name?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    photo?: string;
  }>({});

  useFocusEffect(
    useCallback(() => {
      // Recharge les infos quand on revient sur l'écran
      checkAuth();
    }, [])
  );

  const checkAuth = async () => {
    try {
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        // Récupère le groupe sélectionné au lieu des infos Microsoft
        const selectedGroup = await GroupService.getSelectedGroup();
        
        if (selectedGroup) {
          setUserInfo({
            name: selectedGroup.name,
            email: 'EPITA',
            // Pas de photo, on utilisera juste l'initiale
          });
        }
      }
    } catch (error) {
      console.error('Erreur check auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await AuthService.logout();
            setIsAuthenticated(false);
            setUserInfo({});
          },
        },
      ]
    );
  };

  // 🧪 Bouton de test des permissions
  const handleTestPermissions = async () => {
    await AuthService.testAvailablePermissions();
    await AuthService.testEpitaEndpoints();
    Alert.alert('✅ Test terminé', 'Regarde les logs dans la console');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
        </View>

        {!isAuthenticated ? (
          // Vue non connecté
          <View style={styles.notConnectedContainer}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.loginCard}
            >
              <Text style={styles.loginCardIcon}>🔐</Text>
              <Text style={styles.loginCardTitle}>Non connecté</Text>
              <Text style={styles.loginCardSubtitle}>
                Connectez-vous pour accéder à votre emploi du temps EPITA
              </Text>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.loginButtonText}>
                  Se connecter avec Office365
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Pourquoi se connecter ?</Text>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>📅</Text>
                <Text style={styles.infoText}>
                  Accès à votre emploi du temps personnalisé
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🔔</Text>
                <Text style={styles.infoText}>
                  Notifications pour vos cours
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoIcon}>🎨</Text>
                <Text style={styles.infoText}>
                  Personnalisation des couleurs de matières
                </Text>
              </View>
            </View>
          </View>
        ) : (
          // Vue connecté avec VRAIE photo et nom
          <View style={styles.connectedContainer}>
            <View style={styles.userCard}>
              {/* Photo de profil */}
              {userInfo.photo ? (
                <Image
                  source={{ uri: userInfo.photo }}
                  style={styles.userAvatar}
                />
              ) : (
                <View style={styles.userAvatarPlaceholder}>
                  <Text style={styles.userAvatarText}>
                    {userInfo.firstName?.charAt(0) || userInfo.name?.charAt(0) || '👤'}
                  </Text>
                </View>
              )}

              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {userInfo.name || 'Utilisateur EPITA'}
                </Text>
                <Text style={styles.userEmail}>
                  {userInfo.email || 'epita.fr'}
                </Text>
              </View>
              <View style={styles.connectedBadge}>
                <Text style={styles.connectedBadgeText}>✓</Text>
              </View>
            </View>

            {/* 🧪 Bouton de test temporaire */}
            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestPermissions}
            >
              <Text style={styles.testButtonText}>
                🧪 Tester les permissions disponibles
              </Text>
            </TouchableOpacity>

            {/* Options */}
            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={styles.optionItem}
                onPress={() => router.push('/select-group')}>
                <Text style={styles.optionIcon}>👥</Text>
                <Text style={styles.optionText}>Choisir mon groupe</Text>
                <Text style={styles.optionArrow}>›</Text>
            </TouchableOpacity>

              <TouchableOpacity style={styles.optionItem}>
                <Text style={styles.optionIcon}>🎨</Text>
                <Text style={styles.optionText}>Personnaliser les couleurs</Text>
                <Text style={styles.optionArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionItem}>
                <Text style={styles.optionIcon}>🔔</Text>
                <Text style={styles.optionText}>Notifications</Text>
                <Text style={styles.optionArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Bouton déconnexion */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutButtonText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Version */}
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.light.text.primary,
  },

  // Non connecté
  notConnectedContainer: {
    padding: 20,
  },
  loginCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginCardIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  loginCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  loginCardSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text.primary,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    fontSize: 15,
    color: COLORS.light.text.secondary,
    flex: 1,
  },

  // Connecté
  connectedContainer: {
    padding: 20,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.light.text.secondary,
  },
  connectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedBadgeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 🧪 Bouton de test
  testButton: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Options
  optionsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.light.text.primary,
  },
  optionArrow: {
    fontSize: 24,
    color: COLORS.light.text.secondary,
  },

  // Déconnexion
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Version
  version: {
    textAlign: 'center',
    color: COLORS.light.text.secondary,
    fontSize: 12,
    marginTop: 24,
  },
});