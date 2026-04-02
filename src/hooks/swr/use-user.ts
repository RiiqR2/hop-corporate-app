import useSWR from "swr";
import { getUserById } from "@/src/services/auth.service";
import { User } from "@/src/utils/interfaces/auth.interface";

export const useUser = (user_id: string) => {

  const { data, isLoading, error } = useSWR<Omit<User, "userDocument">>(
    `/user/${user_id}`,
    () => getUserById(user_id!),
    { revalidateOnMount: true }
  );

  return {
    user: data,
    isLoading,
    error,
  };
};
