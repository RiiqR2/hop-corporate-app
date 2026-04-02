import useSWR from "swr";
import { getNotifications, NotificationResponse } from "@/src/services/notification.service";

export const useNotifications = (userId: string) => {

  const { data, isLoading, error, mutate } = useSWR<NotificationResponse>(
    "/notifications/",
    () => getNotifications(userId!),
    {
      revalidateOnMount: true,
      errorRetryInterval: 5000,
    }
  );

  return {
    notifications: data,
    isLoading,
    error,
    mutateNotifications: mutate,
  };
};
