import useSWR from "swr";
import { getTravels } from "@/src/services/book.service";
import { userRoles } from "@/src/utils/enum/role.enum";

interface DataUser {
  id: string;
  role: string;
}

export const useTravelHistory = (dataUser?: DataUser, page: number = 1) => {
  const key = dataUser ? ["/travels/history", page] : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      if (!dataUser) throw new Error("No user data");
      const response = await getTravels(
        dataUser.id,
        dataUser.role === userRoles.USER_HOPPER ? "hopper" : "hoppy",
        false,
        true,
        page
      );
      return response;
    },
    {
      refreshInterval: 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateOnMount: true,
    }
  );

  return {
    travels: data,
    isLoading,
    error,
    mutateTravels: mutate,
  };
};
