// styles/commonStyles.ts
import { StyleSheet } from 'react-native';

// Couleurs du thème
export const colors = {
  primary: '#3498db',
  secondary: '#2c3e50',
  success: '#27ae60',
  warning: '#f39c12',
  danger: '#e74c3c',
  light: '#f8f9fa',
  dark: '#343a40',
  muted: '#7f8c8d',
  border: '#e9ecef',
  background: '#f8f9fa',
  white: '#ffffff',
  today: '#f0f8ff'
};

// Espacements standardisés
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32
};

// Tailles de police standardisées
export const typography = {
  small: 12,
  body: 14,
  subtitle: 16,
  title: 18,
  heading: 20,
  largeHeading: 24,
  hero: 32
};

// Styles de navigation communs
export const navigationStyles = StyleSheet.create({
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  navButton: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.border
  },
  navButtonDisabled: {
    opacity: 0.5
  },
  todayButton: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  navButtonText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colors.secondary,
    textAlign: 'center'
  }
});

// Styles d'en-tête communs
export const headerStyles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center'
  },
  todayHeader: {
    backgroundColor: colors.today,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary
  },
  currentHeader: {
    backgroundColor: colors.today,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary
  },
  title: {
    fontSize: typography.largeHeading,
    fontWeight: 'bold',
    color: colors.secondary,
    textAlign: 'center'
  },
  todayTitle: {
    color: colors.primary
  },
  currentTitle: {
    color: colors.primary
  },
  subtitle: {
    fontSize: typography.subtitle,
    color: colors.muted,
    marginTop: spacing.sm,
    textAlign: 'center'
  }
});

// Styles de contenu communs
export const contentStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollView: {
    flex: 1
  },
  eventsContainer: {
    padding: spacing.lg
  },
  // États vides
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: spacing.xxxl
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg
  },
  emptyTitle: {
    fontSize: typography.heading,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: typography.subtitle,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 24
  },
  // États de chargement
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: typography.subtitle,
    color: colors.muted
  }
});

// Styles de cartes communs
export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: spacing.lg,
    overflow: 'hidden'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  cardContent: {
    padding: spacing.lg
  },
  cardTitle: {
    fontSize: typography.title,
    fontWeight: '600',
    color: colors.secondary,
    textTransform: 'capitalize'
  },
  todayCard: {
    borderWidth: 2,
    borderColor: colors.primary
  },
  todayCardTitle: {
    color: colors.primary
  }
});

// Styles de badges communs
export const badgeStyles = StyleSheet.create({
  badge: {
    fontSize: typography.small,
    fontWeight: '600',
    color: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12
  },
  todayBadge: {
    backgroundColor: colors.primary
  },
  successBadge: {
    backgroundColor: colors.success
  },
  warningBadge: {
    backgroundColor: colors.warning
  },
  dangerBadge: {
    backgroundColor: colors.danger
  }
});

// Utilitaires de layout
export const layoutStyles = StyleSheet.create({
  row: {
    flexDirection: 'row'
  },
  column: {
    flexDirection: 'column'
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  spaceBetween: {
    justifyContent: 'space-between'
  },
  spaceAround: {
    justifyContent: 'space-around'
  },
  alignCenter: {
    alignItems: 'center'
  },
  alignStart: {
    alignItems: 'flex-start'
  },
  alignEnd: {
    alignItems: 'flex-end'
  },
  // Margins
  mt1: { marginTop: spacing.xs },
  mt2: { marginTop: spacing.sm },
  mt3: { marginTop: spacing.md },
  mt4: { marginTop: spacing.lg },
  mb1: { marginBottom: spacing.xs },
  mb2: { marginBottom: spacing.sm },
  mb3: { marginBottom: spacing.md },
  mb4: { marginBottom: spacing.lg },
  // Padding
  p1: { padding: spacing.xs },
  p2: { padding: spacing.sm },
  p3: { padding: spacing.md },
  p4: { padding: spacing.lg },
  px1: { paddingHorizontal: spacing.xs },
  px2: { paddingHorizontal: spacing.sm },
  px3: { paddingHorizontal: spacing.md },
  px4: { paddingHorizontal: spacing.lg },
  py1: { paddingVertical: spacing.xs },
  py2: { paddingVertical: spacing.sm },
  py3: { paddingVertical: spacing.md },
  py4: { paddingVertical: spacing.lg }
});

// Export par défaut avec tous les styles
export default {
  colors,
  spacing,
  typography,
  navigation: navigationStyles,
  header: headerStyles,
  content: contentStyles,
  card: cardStyles,
  badge: badgeStyles,
  layout: layoutStyles
};