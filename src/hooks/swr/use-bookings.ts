import useSWR from "swr";
import { getTravels } from "@/src/services/book.service";
import { userRoles } from "@/src/utils/enum/role.enum";

interface DataUser {
  id: string;
  role: string;
}

export const useTravelBookings = (dataUser?: DataUser, page: number = 1) => {
  const key = dataUser ? ["/travels/bookings", page] : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      if (!dataUser) throw new Error("No user data");
      return getTravels(
        dataUser.id,
        dataUser.role === userRoles.USER_HOPPER ? "hopper" : "hoppy",
        true,
        false,
        page
      );
    },
    {
      refreshInterval: 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateOnMount: true,
    }
  );

  return {
    bookings: data,
    isLoading,
    error,
    mutateBookings: mutate,
  };
};
