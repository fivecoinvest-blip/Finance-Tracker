export const Colors = {
  primary: '#1A2F5A',
  primaryLight: '#2E4A80',
  accent: '#FF6B35',
  accentLight: '#FFE8D6',
  success: '#27AE60',
  danger: '#E74C3C',
  warning: '#F39C12',
  info: '#3498DB',

  backgroundDark: '#0D1B3E',
  backgroundMid: '#1A2F5A',
  card: '#1E3A6E',
  cardLight: '#253F7A',
  border: '#2A4A8A',

  textPrimary: '#FFFFFF',
  textSecondary: '#A8B8D8',
  textMuted: '#6B82A8',
  textDark: '#FFFFFF',

  income: '#27AE60',
  expense: '#E74C3C',
  transfer: '#3498DB',

  tabBar: '#0D1B3E',
  tabBarBorder: '#1A2F5A',
  tabActive: '#FF6B35',
  tabInactive: '#6B82A8',

  xpGold: '#FF6B35',
  xpSilver: '#A8B8D8',
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
