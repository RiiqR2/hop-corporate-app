import useSWR from "swr";
import { getUserLogged } from "@/src/services/auth.service";
import { User } from "@/src/utils/interfaces/auth.interface";

export const useMe = () => {
  const { data: user, isLoading, error, mutate } = useSWR<User>("/user/logged", getUserLogged, {
    refreshInterval: 5000
  });

  return {
    user,
    isLoading,
    error,
    mutateUser: mutate,
  };
};
