import { User } from '@shared/schema';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('myverse-user');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to parse stored user:', error);
    return null;
  }
};

export const setStoredUser = (user: User | null): void => {
  if (typeof window === 'undefined') return;
  
  if (user) {
    localStorage.setItem('myverse-user', JSON.stringify(user));
  } else {
    localStorage.removeItem('myverse-user');
  }
};

export const clearAuth = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('myverse-user');
  localStorage.removeItem('myverse-storage');
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateUserAvatarUrl = (name: string): string => {
  if (!name) return '';
  
  // Generate a simple avatar URL based on initials
  const initials = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
    
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=a855f7&color=fff&size=200`;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const validateUserProfile = (user: Partial<User>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!user.email) {
    errors.push('Email is required');
  } else if (!isValidEmail(user.email)) {
    errors.push('Valid email is required');
  }
  
  if (!user.name || user.name.trim().length === 0) {
    errors.push('Name is required');
  } else if (user.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  if (user.portfolioLink && !isValidUrl(user.portfolioLink)) {
    errors.push('Portfolio link must be a valid URL');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const formatUserDisplayName = (user: User | null): string => {
  if (!user) return 'User';
  
  if (user.name && user.name.trim()) {
    return user.name.trim();
  }
  
  // Fallback to email username
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'User';
};

export const getUserInitials = (user: User | null): string => {
  if (!user) return 'U';
  
  const name = formatUserDisplayName(user);
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

export const shouldShowOnboarding = (user: User | null): boolean => {
  if (!user) return false;
  
  // Show onboarding if user doesn't have a name set
  return !user.name || user.name.trim().length === 0;
};

// Session management
export const createUserSession = (user: User): void => {
  setStoredUser(user);
  
  // Track session start time
  localStorage.setItem('myverse-session-start', Date.now().toString());
};

export const getSessionDuration = (): number => {
  const startTime = localStorage.getItem('myverse-session-start');
  if (!startTime) return 0;
  
  return Date.now() - parseInt(startTime, 10);
};

export const formatSessionDuration = (duration: number): string => {
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  
  return `${seconds}s`;
};

// Theme management helpers
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyTheme = (theme: 'light' | 'dark' | 'system'): void => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === 'system') {
    const systemTheme = getSystemTheme();
    root.classList.toggle('dark', systemTheme === 'dark');
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
};

// Focus mode helpers
export const getFocusModeTimeLeft = (): number => {
  const startTime = localStorage.getItem('myverse-focus-start');
  const duration = localStorage.getItem('myverse-focus-duration');
  
  if (!startTime || !duration) return 0;
  
  const elapsed = Date.now() - parseInt(startTime, 10);
  const total = parseInt(duration, 10);
  
  return Math.max(0, total - elapsed);
};

export const startFocusMode = (durationMinutes: number = 25): void => {
  localStorage.setItem('myverse-focus-start', Date.now().toString());
  localStorage.setItem('myverse-focus-duration', (durationMinutes * 60 * 1000).toString());
};

export const endFocusMode = (): void => {
  localStorage.removeItem('myverse-focus-start');
  localStorage.removeItem('myverse-focus-duration');
};

export const isFocusModeActive = (): boolean => {
  return getFocusModeTimeLeft() > 0;
};
