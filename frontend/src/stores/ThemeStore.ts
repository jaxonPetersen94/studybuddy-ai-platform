import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'StudyBuddy' | 'StudyBuddy-Dark';

interface ThemeStore {
  theme: Theme;
  isDarkMode: boolean;
  followSystemTheme: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setFollowSystemTheme: (follow: boolean) => void;
}

const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme);
};

const isDarkTheme = (theme: Theme): boolean => {
  return theme.includes('Dark');
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'StudyBuddy',
      isDarkMode: false,
      followSystemTheme: true,

      // Actions
      setTheme: (theme) => {
        const isDark = isDarkTheme(theme);
        set({ theme, isDarkMode: isDark });
        applyTheme(theme);
      },

      toggleTheme: () => {
        const current = get().theme;
        const newTheme =
          current === 'StudyBuddy' ? 'StudyBuddy-Dark' : 'StudyBuddy';

        // When user manually toggles, stop following system theme
        set({ followSystemTheme: false });
        get().setTheme(newTheme);
      },

      setFollowSystemTheme: (follow) => {
        set({ followSystemTheme: follow });

        if (follow) {
          const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)',
          ).matches;
          const theme = prefersDark ? 'StudyBuddy-Dark' : 'StudyBuddy';
          get().setTheme(theme);
        }
      },
    }),
    {
      name: 'theme-preferences',
      partialize: (state) => ({
        theme: state.theme,
        followSystemTheme: state.followSystemTheme,
      }),
    },
  ),
);

export const initializeTheme = (): void => {
  const { theme, followSystemTheme, setTheme } = useThemeStore.getState();

  // Apply stored theme immediately and ensure isDarkMode is in sync
  applyTheme(theme);
  useThemeStore.setState({ isDarkMode: isDarkTheme(theme) });

  // Only override saved theme if user wants to follow system AND it's different
  if (followSystemTheme) {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    const expectedTheme = prefersDark ? 'StudyBuddy-Dark' : 'StudyBuddy';

    if (theme !== expectedTheme) {
      setTheme(expectedTheme);
    }

    // Listen for system theme changes
    const darkModeMediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)',
    );
    const themeChangeHandler = (e: MediaQueryListEvent) => {
      if (useThemeStore.getState().followSystemTheme) {
        setTheme(e.matches ? 'StudyBuddy-Dark' : 'StudyBuddy');
      }
    };

    darkModeMediaQuery.addEventListener('change', themeChangeHandler);
  }
};
