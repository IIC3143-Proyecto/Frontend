import { useQuery } from '@tanstack/react-query';
import { User } from '@/types/user'; // Tu interfaz

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await fetch('/api/users/me');

      if (!res.ok) throw new Error('Error al obtener perfil');

      const data = await res.json();

      return data;
    },
    retry: 1,
  });
}