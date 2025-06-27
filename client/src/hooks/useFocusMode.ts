import { useStore } from '@/lib/store';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './useAuth';

export function useFocusMode() {
  const { focusModeEnabled, setFocusMode } = useStore();
  const { user } = useAuth();

  const updateFocusModeMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (user) {
        await apiRequest("PATCH", `/api/user/${user.id}`, { focusModeEnabled: enabled });
      }
    },
    onSuccess: (_, enabled) => {
      setFocusMode(enabled);
    },
  });

  const toggleFocusMode = () => {
    const newState = !focusModeEnabled;
    updateFocusModeMutation.mutate(newState);
  };

  return {
    focusModeEnabled,
    toggleFocusMode,
    isUpdating: updateFocusModeMutation.isPending,
  };
}
