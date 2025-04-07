import { useThemeContext } from '../contexts/ThemeContext';
import { colors } from '../constants/theme';

export function useTheme() {
  const { theme } = useThemeContext();
  return colors[theme];
}
