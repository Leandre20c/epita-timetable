// app/(tabs)/profile.tsx

import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowUpRight } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomAlert } from '../../components/CustomAlert';
import { Screen } from '../../components/Screen';
import { AuthService } from '../../services/AuthService';
import { GroupService } from '../../services/GroupeService';
import { COLORS } from '../../styles/screenStyles';
import EventEmitter from '../../utils/EventEmitter';

export default function ProfileScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    name?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    photo?: string;
  }>({});

  useEffect(() => {
    const handleGroupChange = () => {
      console.log('🔄 Groupe changé, rechargement...');
      checkAuth();
    };

    EventEmitter.on('groupChanged', handleGroupChange);

    return () => {
      EventEmitter.off('groupChanged', handleGroupChange);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [])
  );

  const checkAuth = async () => {
    try {
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const selectedGroup = await GroupService.getSelectedGroup();
        
        if (selectedGroup) {
          setUserInfo({
            name: selectedGroup.name,
            email: 'EPITA',
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

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const confirmLogout = async () => {
    setShowLogoutAlert(false);
    await AuthService.logout();
    setIsAuthenticated(false);
    setUserInfo({});
  };

  if (isLoading) {
    return (
      <Screen 
        isAuthenticated={null} 
        isRefreshing={true} 
        loadingText="Chargement du profil..." 
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>EpiTime</Text>
            <Text style={styles.version}>Version 1.2.2</Text>
          </View>

          {isAuthenticated && (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutButtonText}>Se déconnecter</Text>
            </TouchableOpacity>
          )}
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
          </View>
        ) : (
          // Vue connecté
          <View style={styles.connectedContainer}>
            <TouchableOpacity
              style={styles.userCard}
              onPress={() => router.push('/select-group')}
            >
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
                  {userInfo.name || 'Choisir un groupe'}
                </Text>
                <Text style={styles.userEmail}>
                  {userInfo.email || ''}
                </Text>
              </View>
              <Text style={styles.connectedBadge}>
                <ArrowUpRight size={50} color={COLORS.light.text.primary} strokeWidth={1.5}/>
              </Text>
            </TouchableOpacity>

            {/* Lien GitHub */}
            <TouchableOpacity
              style={styles.githubContainer}
              onPress={() => {
                Linking.openURL('https://github.com/Leandre20c/epita-timetable');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.githubIcon}>⭐</Text>
              <Text style={styles.githubText}>
                Met une étoile sur GitHub si tu aimes l'app !
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Alert de confirmation de déconnexion - 2 boutons */}
      <CustomAlert
        visible={showLogoutAlert}
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutAlert(false)}
        confirmText="Déconnexion"
        cancelText="Annuler"
        type="deconnexion"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.light.text.primary,
  },
  version: {
    textAlign: 'left',
    color: COLORS.light.text.secondary,
    fontSize: 12,
  },
  logoutButton: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
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
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // GitHub Star
  githubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 30,
    padding: 16,
    backgroundColor: '#f6f8fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0d7de',
  },
  githubIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  githubText: {
    fontSize: 14,
    color: '#57606a',
    fontWeight: '500',
  },
});