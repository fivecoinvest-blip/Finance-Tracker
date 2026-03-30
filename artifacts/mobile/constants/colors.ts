export const LightColors = {
  primary: '#FF6B35',
  primaryLight: '#FF8C5A',
  accent: '#FF6B35',
  accentLight: '#FFF0E8',

  success: '#27AE60',
  danger: '#E74C3C',
  warning: '#F39C12',
  info: '#3498DB',

  backgroundDark: '#FFF8F4',
  backgroundMid: '#FFFFFF',
  card: '#FFFFFF',
  cardLight: '#FFF5EF',
  border: '#F0E8E2',

  textPrimary: '#1C1C1E',
  textSecondary: '#6C6C70',
  textMuted: '#AEAEB2',
  textDark: '#FFFFFF',

  income: '#27AE60',
  expense: '#E74C3C',
  transfer: '#3498DB',

  tabBar: '#FFFFFF',
  tabBarBorder: '#F0E8E2',
  tabActive: '#FF6B35',
  tabInactive: '#AEAEB2',

  xpGold: '#FF6B35',
  xpSilver: '#8E8E93',
  xpBronze: '#CD7F32',

  categoryFood: '#E74C3C',
  categoryTransport: '#3498DB',
  categoryBills: '#9B59B6',
  categoryShopping: '#E67E22',
  categoryHealth: '#27AE60',
  categoryEntertainment: '#1ABC9C',
  categoryEducation: '#F39C12',
  categorySavings: '#2ECC71',
  categorySalary: '#27AE60',
  categoryOther: '#95A5A6',
};

export const DarkColors = {
  primary: '#FF6B35',
  primaryLight: '#FF8C5A',
  accent: '#FF6B35',
  accentLight: '#3A2015',

  success: '#2ECC71',
  danger: '#FF5252',
  warning: '#FFA726',
  info: '#42A5F5',

  backgroundDark: '#0E0E10',
  backgroundMid: '#1A1A1D',
  card: '#242428',
  cardLight: '#2E2E33',
  border: '#3A3A40',

  textPrimary: '#F2F2F7',
  textSecondary: '#AEAEB2',
  textMuted: '#636366',
  textDark: '#FFFFFF',

  income: '#2ECC71',
  expense: '#FF5252',
  transfer: '#42A5F5',

  tabBar: '#1A1A1D',
  tabBarBorder: '#3A3A40',
  tabActive: '#FF6B35',
  tabInactive: '#636366',

  xpGold: '#FF6B35',
  xpSilver: '#8E8E93',
  xpBronze: '#CD7F32',

  categoryFood: '#EF5350',
  categoryTransport: '#42A5F5',
  categoryBills: '#AB47BC',
  categoryShopping: '#FFA726',
  categoryHealth: '#66BB6A',
  categoryEntertainment: '#26C6DA',
  categoryEducation: '#FFCA28',
  categorySavings: '#66BB6A',
  categorySalary: '#66BB6A',
  categoryOther: '#78909C',
};

export type ColorPalette = typeof LightColors;

export const Colors = LightColors;

export const CATEGORY_COLORS: Record<string, string> = {
  Food: LightColors.categoryFood,
  Transport: LightColors.categoryTransport,
  Bills: LightColors.categoryBills,
  Shopping: LightColors.categoryShopping,
  Health: LightColors.categoryHealth,
  Entertainment: LightColors.categoryEntertainment,
  Education: LightColors.categoryEducation,
  Savings: LightColors.categorySavings,
  Salary: LightColors.categorySalary,
  Other: LightColors.categoryOther,
  Transfer: LightColors.transfer,
};

export const CATEGORY_ICONS: Record<string, string> = {
  Food: 'restaurant',
  Transport: 'directions-car',
  Bills: 'receipt',
  Shopping: 'shopping-bag',
  Health: 'favorite',
  Entertainment: 'movie',
  Education: 'school',
  Savings: 'savings',
  Salary: 'work',
  Other: 'category',
  Transfer: 'swap-horiz',
};

export default Colors;
