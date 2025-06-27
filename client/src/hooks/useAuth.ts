import { useStore } from '@/lib/store';

export function useAuth() {
  const { user, setUser } = useStore();

  return {
    user,
    setUser,
    isLoading: false, // Since we're using local storage, no loading state needed
    logout: () => setUser(null),
  };
}
