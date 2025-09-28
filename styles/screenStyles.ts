import { StyleSheet } from 'react-native';

// ===================================
// CONSTANTES GLOBALES
// ===================================

const COLORS = {
  primary: '#3498db',
  secondary: '#7f8c8d',
  background: '#f8f9fa',
  cardBackground: '#ffffff',
  border: '#e9ecef',
  success: '#27ae60',
  warning: '#f39c12',
  danger: '#e74c3c',
  text: {
    primary: '#2c3e50',
    secondary: '#7f8c8d',
    light: '#bdc3c7',
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
// STYLES PRINCIPAUX
// ===================================

export const screenStyles = StyleSheet.create({
  
  // --- CONTENEURS PRINCIPAUX ---
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    //paddingBottom: FLOATING_TAB_HEIGHT + FLOATING_TAB_BOTTOM_SPACE + 20, // Espace pour la tab bar flottante
  },

  tabBarFadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200, // Hauteur du fondu
    zIndex: 1,
    pointerEvents: 'none', // Permet les interactions sous l'overlay
    },

  scrollView: { 
    flex: 1,
  },

  // --- ÉTATS DE CHARGEMENT ---
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },

  // --- NAVIGATION EN HAUT ---
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.text.primary,
  },

  todayButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
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
    color: '#ffffff',
  },

  // --- TAB BAR FLOTTANTE ---
  // Styles pour les éléments de la tab bar (utilisés dans _layout.tsx)
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
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    paddingTop: 55,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
    elevation: 5,
  },

  todayHeader: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 0,
    borderLeftColor: COLORS.primary,
  },

  dayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textTransform: 'capitalize',
    textAlign: 'center',
  },

  todayTitle: {
    color: COLORS.primary,
  },

  // --- HEADERS (SEMAINE) ---
  weekHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },

  currentWeekHeader: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 0,
    borderLeftColor: COLORS.primary,
  },

  weekTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
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
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },

  currentMonthHeader: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },

  monthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textTransform: 'capitalize',
    textAlign: 'center',
  },

  currentMonthTitle: {
    color: COLORS.primary,
  },

  // --- ÉLÉMENTS COMMUNS AUX HEADERS ---
  eventCount: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
    fontWeight: '500',
  },

  // --- CONTENEURS D'ÉVÉNEMENTS ---
  eventsContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.md,
  },

  daySection: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  todaySection: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 12,
    textTransform: 'capitalize',
  },

  todaySectionTitle: {
    color: COLORS.primary,
  },

  // --- CARDS D'ÉVÉNEMENTS ---
  eventCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 0,
    borderLeftWidth: 8,
    borderLeftColor: COLORS.primary,
  },

  eventCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  eventTime: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },

  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },

  eventLocation: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },

  // --- PROFIL ---
  appHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },

  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'left',
    marginBottom: SPACING.sm,
    marginHorizontal: 40,
  },

  appSubtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'left',
    marginHorizontal: 40,
  },

  profileHeader: {
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    color: '#20232a',
    textAlign: 'left',
    marginHorizontal: 40,
    elevation: 15,
    flexDirection: 'row', // Ajouter
    alignItems: 'center', // Ajouter
    justifyContent: 'space-between',
    height: 120,
  },

  profileTextContainer: {
    flex: 1,
    paddingLeft: 16,
},

profileTypeClass: {
  color: '#ffffff',
  fontSize: 30,
  fontWeight: 'bold',
},

profileTypeGroup: {
  color: '#ffffff',
  fontSize: 30,
  fontWeight: 'ultralight',
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
    paddingBottom: 120, // Espace extra pour la tab bar flottante
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

// ===================================
// EXPORTS
// ===================================

export { COLORS, FLOATING_TAB_HEIGHT, SPACING };

