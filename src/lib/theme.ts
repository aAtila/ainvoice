export type Theme = 'light' | 'dark';

export const getInitialTheme = (): Theme => {
  // Check if we're on the server
  if (typeof window === 'undefined') {
    return 'light';
  }

  // Check localStorage
  const savedTheme = localStorage.getItem('theme') as Theme | null;
  if (savedTheme) {
    return savedTheme;
  }

  // Check system preference
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

  return systemTheme;
};

export const applyTheme = (theme: Theme) => {
  if (typeof window === 'undefined') {
    return;
  }

  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  
  // Save to localStorage
  localStorage.setItem('theme', theme);
};

export const initializeTheme = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const theme = getInitialTheme();
  applyTheme(theme);

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    // Only apply system theme if user hasn't explicitly set a theme
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
};