import { useThemeContext } from '../context/ThemeContext';
import { colors } from '../constants/theme';

export function useTheme() {
  const { theme } = useThemeContext();
  return colors[theme];
}
