import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeMode } from '../types/userTypes';

type DaisyUITheme = 'StudyBuddy' | 'StudyBuddy-Dark';

interface ThemeStore {
  // User-facing theme mode
  themeMode: ThemeMode;

  // Internal DaisyUI theme name
  currentTheme: DaisyUITheme;

  // Computed state
  isDarkMode: boolean;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;

  // Internal methods
  updateSystemTheme: () => void;
}

const applyTheme = (theme: DaisyUITheme) => {
  document.documentElement.setAttribute('data-theme', theme);
};

const getThemeFromMode = (
  mode: ThemeMode,
  systemPrefersDark: boolean,
): DaisyUITheme => {
  switch (mode) {
    case 'light':
      return 'StudyBuddy';
    case 'dark':
      return 'StudyBuddy-Dark';
    case 'auto':
      return systemPrefersDark ? 'StudyBuddy-Dark' : 'StudyBuddy';
    default:
      return 'StudyBuddy';
  }
};

const isDarkTheme = (theme: DaisyUITheme): boolean => {
  return theme === 'StudyBuddy-Dark';
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      themeMode: 'auto',
      currentTheme: 'StudyBuddy',
      isDarkMode: false,

      // Set theme mode (user preference)
      setThemeMode: (mode: ThemeMode) => {
        const systemPrefersDark = window.matchMedia(
          '(prefers-color-scheme: dark)',
        ).matches;
        const newTheme = getThemeFromMode(mode, systemPrefersDark);
        const isDark = isDarkTheme(newTheme);

        set({
          themeMode: mode,
          currentTheme: newTheme,
          isDarkMode: isDark,
        });
        applyTheme(newTheme);
      },

      // Update theme when system preference changes (only if mode is 'auto')
      updateSystemTheme: () => {
        const { themeMode } = get();
        if (themeMode === 'auto') {
          const systemPrefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)',
          ).matches;
          const newTheme = getThemeFromMode('auto', systemPrefersDark);
          const isDark = isDarkTheme(newTheme);

          set({
            currentTheme: newTheme,
            isDarkMode: isDark,
          });
          applyTheme(newTheme);
        }
      },
    }),
    {
      name: 'theme-preferences',
      partialize: (state) => ({
        themeMode: state.themeMode,
      }),
    },
  ),
);

export const initializeTheme = (): (() => void) => {
  const { themeMode, setThemeMode, updateSystemTheme } =
    useThemeStore.getState();

  // Apply the current theme mode
  setThemeMode(themeMode);

  // Listen for system theme changes
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const themeChangeHandler = () => {
    updateSystemTheme();
  };

  darkModeMediaQuery.addEventListener('change', themeChangeHandler);

  // Return cleanup function
  return () => {
    darkModeMediaQuery.removeEventListener('change', themeChangeHandler);
  };
};
