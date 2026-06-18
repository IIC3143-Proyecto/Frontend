import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAccessToken } from '@/actions/auth';
import {
  fetchNotifications,
  deleteNotification,
  deleteAllNotifications,
} from '@/lib/api/notification';
import type { NotificationDto } from '@/lib/types/notification';

export function useNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return fetchNotifications(accessToken);
    },
  });

  const deleteOne = async (id: string) => {
    const previous = queryClient.getQueryData<NotificationDto[]>(['notifications']);
    queryClient.setQueryData<NotificationDto[]>(
      ['notifications'],
      (prev) => prev?.filter((n) => n.id !== id) ?? []
    );
    try {
      const accessToken = await getAccessToken();
      await deleteNotification(id, accessToken);
    } catch {
      queryClient.setQueryData(['notifications'], previous);
      toast.error('No se pudo eliminar la notificación');
    }
  };

  const deleteAll = async () => {
    const previous = queryClient.getQueryData<NotificationDto[]>(['notifications']);
    queryClient.setQueryData(['notifications'], []);
    try {
      const accessToken = await getAccessToken();
      await deleteAllNotifications(accessToken);
    } catch {
      queryClient.setQueryData(['notifications'], previous);
      toast.error('No se pudieron eliminar las notificaciones');
    }
  };

  return { notifications, isLoading, deleteOne, deleteAll };
}
