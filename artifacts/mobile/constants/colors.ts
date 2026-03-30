export const Colors = {
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

export const CATEGORY_COLORS: Record<string, string> = {
  Food: Colors.categoryFood,
  Transport: Colors.categoryTransport,
  Bills: Colors.categoryBills,
  Shopping: Colors.categoryShopping,
  Health: Colors.categoryHealth,
  Entertainment: Colors.categoryEntertainment,
  Education: Colors.categoryEducation,
  Savings: Colors.categorySavings,
  Salary: Colors.categorySalary,
  Other: Colors.categoryOther,
  Transfer: Colors.transfer,
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
