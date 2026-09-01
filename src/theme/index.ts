/**
 * SaveVolt Design System
 * Premium, modern energy tracking app theme
 */

// ─── Color Palette ──────────────────────────────────────────────
export const Colors = {
  // Brand
  primary:      '#00E676',   // Electric green — hero accent
  primaryDark:  '#00C853',
  primaryDeep:  '#00A844',
  primaryLight: '#B9F6CA',
  primarySoft:  '#E8F5E9',

  // Accent
  accent:       '#7C4DFF',   // Electric purple — AI/premium feel
  accentLight:  '#EDE7F6',
  accentSoft:   '#D1C4E9',

  // Surfaces
  background:   '#F0F2F5',
  card:         '#FFFFFF',
  cardElevated: '#FFFFFF',

  // Dark / Header
  dark:         '#0B1120',   // Luxury dark navy — headers
  darkSoft:     '#1A2332',
  darkCard:     '#162032',

  // Text
  text:         '#0F172A',
  textSecondary:'#64748B',
  textMuted:    '#94A3B8',
  textOnDark:   '#FFFFFF',
  textOnDarkSub:'rgba(255,255,255,0.7)',

  // Semantic
  success:      '#10B981',
  warning:      '#F59E0B',
  danger:       '#EF4444',
  info:         '#3B82F6',

  // Borders & Dividers
  border:       '#E2E8F0',
  borderLight:  '#F1F5F9',
  divider:      '#F1F5F9',

  // Chart colors (harmonized palette)
  chart: [
    '#00E676', '#7C4DFF', '#3B82F6', '#F59E0B',
    '#EF4444', '#EC4899', '#14B8A6', '#8B5CF6',
  ],

  // Tab bar
  tabActive:    '#00E676',
  tabInactive:  '#94A3B8',
  tabBar:       '#FFFFFF',
};

// ─── Typography ─────────────────────────────────────────────────
export const Typography = {
  // Display — hero numbers, big stats
  displayLarge:  { fontSize: 40, fontWeight: '800' as const, letterSpacing: -1.5 },
  displayMedium: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -1 },
  displaySmall:  { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },

  // Headings
  h1: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.2 },
  h3: { fontSize: 17, fontWeight: '600' as const, letterSpacing: 0 },

  // Body
  bodyLarge:  { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySmall:  { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },

  // Labels
  label:      { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.3 },
  labelSmall: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5 },
  overline:   { fontSize: 10, fontWeight: '700' as const, letterSpacing: 1.2, textTransform: 'uppercase' as const },

  // Numbers
  stat:       { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.5 },
  statSmall:  { fontSize: 16, fontWeight: '700' as const, letterSpacing: -0.3 },
};

// ─── Spacing ────────────────────────────────────────────────────
export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
  xxxl: 32,
  page: 20,       // standard horizontal page padding
  section: 24,    // vertical gap between sections
};

// ─── Radius ─────────────────────────────────────────────────────
export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  pill:  999,
  card:  16,
};

// ─── Shadows ────────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  glow: {
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};

// ─── Common Styles ──────────────────────────────────────────────
export const CommonStyles = {
  screenContainer: {
    flex: 1 as const,
    backgroundColor: Colors.background,
  },
  darkHeader: {
    backgroundColor: Colors.dark,
    paddingHorizontal: Spacing.page,
    paddingTop: 50,
    paddingBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
};
