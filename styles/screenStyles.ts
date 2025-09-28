import { StyleSheet } from 'react-native';

// ===================================
// CONSTANTES GLOBALES
// ===================================

const COLORS = {
  // Couleur principale (ton bleu pour les accents)
  primary: '#102B65',
  primaryLight: '#4F6FA7',
  primaryDark: '#0D2352',
  
  // Couleur secondaire (neutre pour les éléments secondaires)
  secondary: '#6B7280',
  secondaryLight: '#9CA3AF',
  secondaryDark: '#4B5563',
  
  // Couleurs d'état
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  
  // Theme Light
  light: {
    background: '#FFFFFF',
    surface: '#F8F9FA',
    cardBackground: '#FFFFFF',
    border: '#E5E7EB',
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      light: '#9CA3AF',
      accent: '#102B65',
    },
  },
  
  // Theme Dark
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    cardBackground: '#334155',
    border: '#475569',
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      light: '#94A3B8',
      accent: '#60A5FA',
    },
  },
  
  // Variantes du bleu principal pour différents usages
  blue: {
    50: '#F0F4F8',
    100: '#E8EDF7',
    200: '#C5D4E8',
    300: '#8BA4D0',
    400: '#4F6FA7',
    500: '#102B65', // Couleur principale
    600: '#0D2352',
    700: '#0A1D43',
    800: '#081734',
    900: '#051025',
  },
} as const;

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

const FLOATING_TAB_HEIGHT = 70;
const FLOATING_TAB_MARGIN = 20;
const FLOATING_TAB_BOTTOM_SPACE = 10;

// ===================================
// FONCTION POUR ACCÈS DYNAMIQUE AUX COULEURS
// ===================================

// Pour utiliser dans tes composants : getColor('background') ou getColor('text.primary')
export const getColor = (path: string, theme: 'light' | 'dark' = 'light') => {
  if (path.startsWith('light.') || path.startsWith('dark.')) {
    // Si le chemin spécifie déjà le thème, l'utiliser directement
    const keys = path.split('.');
    let value: any = COLORS;
    for (const key of keys) {
      value = value[key];
    }
    return value;
  }
  
  // Sinon, utiliser le thème passé en paramètre
  const keys = path.split('.');
  let value: any = COLORS[theme];
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

// ===================================
// STYLES PRINCIPAUX
// ===================================

export const screenStyles = StyleSheet.create({
  
  // --- CONTENEURS PRINCIPAUX ---
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background, // Blanc en light, sera sombre en dark
  },

  tabBarFadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    zIndex: 1,
    pointerEvents: 'none',
  },

  scrollView: { 
    flex: 1,
  },

  // --- ÉTATS DE CHARGEMENT ---
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light.background,
  },

  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.light.text.secondary, // Gris neutre
    fontWeight: '500',
  },

  // --- NAVIGATION EN HAUT ---
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.light.cardBackground, // Blanc
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border, // Bordure gris très clair
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  navButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.light.surface, // Gris très clair
    borderWidth: 1,
    borderColor: COLORS.light.border,
    minWidth: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.light.text.primary, // Texte sombre
  },

  // BOUTON "AUJOURD'HUI" - SEUL ÉLÉMENT BLEU DE LA NAVIGATION
  todayButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primary, // BLEU - seul accent coloré
    borderWidth: 1,
    borderColor: COLORS.primary,
    minWidth: 50,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  todayButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF', // Blanc sur bleu
  },

  // --- TAB BAR FLOTTANTE ---
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 4,
  },

  tabBarItemStyle: {
    borderRadius: 20,
    marginHorizontal: 4,
    paddingVertical: 4,
  },

  floatingTabSafeArea: {
    paddingBottom: FLOATING_TAB_HEIGHT + FLOATING_TAB_BOTTOM_SPACE,
  },

  // --- HEADERS (JOUR) ---
  dayHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.light.cardBackground, // Blanc
    borderBottomWidth: 1,
    paddingTop: 55,
    borderBottomColor: COLORS.light.border,
    alignItems: 'center',
    elevation: 5,
  },

  // HEADER AUJOURD'HUI - ACCENT BLEU SUBTIL
  todayHeader: {
    backgroundColor: COLORS.blue[50], // Bleu très très clair
  },

  dayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.light.text.primary, // Texte sombre
    textTransform: 'capitalize',
    textAlign: 'center',
    marginBottom: 8,
  },

  todayTitle: {
    color: COLORS.primary, // Bleu pour "Aujourd'hui"
  },

  // --- HEADERS (SEMAINE) ---
  weekHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.light.background,
    alignItems: 'center',
  },

  currentWeekHeader: {
    backgroundColor: COLORS.blue[50],
  },

  weekTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.light.text.primary,
    textTransform: 'capitalize',
    textAlign: 'center',
  },

  currentWeekTitle: {
    color: COLORS.primary,
  },

  // --- HEADERS (MOIS) ---
  monthHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.light.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
    alignItems: 'center',
  },

  currentMonthHeader: {
    backgroundColor: COLORS.blue[50],
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },

  monthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.light.text.primary,
    textTransform: 'capitalize',
    textAlign: 'center',
  },

  currentMonthTitle: {
    color: COLORS.primary,
  },

  // --- ÉLÉMENTS COMMUNS AUX HEADERS ---
  eventCount: {
    fontSize: 16,
    color: COLORS.light.text.secondary, // Gris neutre
    marginTop: SPACING.sm,
    fontWeight: '500',
  },

  // --- CONTENEURS D'ÉVÉNEMENTS ---
  eventsContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.light.background, // Blanc
  },

  daySection: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.light.surface, // Gris très clair
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // SECTION AUJOURD'HUI - ACCENT BLEU
  todaySection: {
    borderWidth: 2,
    borderColor: COLORS.primary, // Bordure bleue
    backgroundColor: COLORS.blue[50], // Background bleu très clair
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text.primary, // Texte sombre
    marginBottom: 12,
    textTransform: 'capitalize',
  },

  todaySectionTitle: {
    color: COLORS.primary, // Bleu pour "Aujourd'hui"
  },

  // --- CARDS D'ÉVÉNEMENTS ---
  eventCard: {
    backgroundColor: COLORS.light.cardBackground, // Blanc
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4, // Accent bleu subtil
    borderLeftColor: COLORS.blue[300], // Bleu moyen (pas trop fort)
  },

  eventCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  eventTime: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary, // Bleu pour l'heure (élément important)
    marginBottom: SPACING.xs,
  },

  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.text.primary, // Texte sombre
    marginBottom: SPACING.xs,
  },

  eventLocation: {
    fontSize: 14,
    color: COLORS.light.text.secondary, // Gris neutre
  },

  // --- PROFIL ---
  appHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },

  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.light.text.primary, // Texte sombre
    textAlign: 'left',
    marginBottom: SPACING.sm,
    marginHorizontal: 40,
  },

  appSubtitle: {
    fontSize: 16,
    color: COLORS.light.text.secondary, // Gris neutre
    textAlign: 'left',
    marginHorizontal: 40,
  },

  // HEADER PROFIL - SEUL GROS ÉLÉMENT BLEU
  profileHeader: {
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.primary, // BLEU principal
    textAlign: 'left',
    marginHorizontal: 40,
    elevation: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 120,
  },

  profileTextContainer: {
    flex: 1,
    paddingLeft: 16,
  },

  profileTypeClass: {
    color: '#FFFFFF', // Blanc sur bleu
    fontSize: 30,
    fontWeight: 'bold',
  },

  profileTypeGroup: {
    color: '#FFFFFF', // Blanc sur bleu
    fontSize: 30,
    fontWeight: '300', // Plus léger
  },

  profileTypeSwitch: {
    paddingRight: 16,
  },

  // --- ÉTATS VIDES ---
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: SPACING.xl,
    paddingBottom: 120,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.light.text.primary, // Texte sombre
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 16,
    color: COLORS.light.text.secondary, // Gris neutre
    textAlign: 'center',
    lineHeight: 24,
  },
});

export const modalStyles = StyleSheet.create({
  // Styles de base pour modales
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.light.background, // Blanc
  },
  
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
    backgroundColor: COLORS.light.surface, // Gris très clair
  },
  
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.light.text.primary, // Texte sombre
  },
  
  modalCloseButton: {
    padding: SPACING.xs,
  },
  
  // Sections communes
  section: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.light.surface, // Gris très clair
    borderRadius: 12,
  },
  
  sectionWithBorder: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.light.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary, // Accent bleu
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.light.text.primary, // Texte sombre
    marginBottom: SPACING.sm,
  },
  
  // Lignes d'information
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  
  infoText: {
    fontSize: 16,
    color: COLORS.light.text.primary, // Texte sombre
    flex: 1,
  },
  
  // Boutons d'action
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.light.surface,
    borderRadius: 12,
    gap: SPACING.md,
  },
  
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.light.text.primary, // Texte sombre
    flex: 1,
  },
  
  // Badges et statuts avec couleurs d'état
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    backgroundColor: COLORS.primary, // Bleu par défaut
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF', // Blanc sur couleur
  },
  
  // Badges de couleurs d'état
  successBadge: {
    backgroundColor: COLORS.success,
  },
  
  warningBadge: {
    backgroundColor: COLORS.warning,
  },
  
  dangerBadge: {
    backgroundColor: COLORS.danger,
  },
  
  infoBadge: {
    backgroundColor: COLORS.info,
  },
  
  // Grilles de couleurs
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    justifyContent: 'center',
  },
  
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  selectedColorOption: {
    borderColor: COLORS.primary, // Bordure bleue pour sélection
  },
  
  // Textes secondaires
  secondaryText: {
    fontSize: 14,
    color: COLORS.light.text.secondary, // Gris neutre
    lineHeight: 20,
  },
  
  descriptionText: {
    fontSize: 15,
    color: COLORS.light.text.secondary, // Gris neutre
    lineHeight: 22,
  },

  // Boutons primaires (bleus)
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Boutons secondaires (neutres)
  secondaryButton: {
    backgroundColor: COLORS.light.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },

  secondaryButtonText: {
    color: COLORS.light.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

// ===================================
// STYLES POUR MODE SOMBRE (À UTILISER CONDITIONNELLEMENT)
// ===================================

export const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.dark.background,
  },
  
  text: {
    color: COLORS.dark.text.primary,
  },
  
  surface: {
    backgroundColor: COLORS.dark.surface,
  },
  
  cardBackground: {
    backgroundColor: COLORS.dark.cardBackground,
  },
  
  border: {
    borderColor: COLORS.dark.border,
  },
});

// ===================================
// EXPORTS
// ===================================

export { COLORS, FLOATING_TAB_HEIGHT, SPACING };

