import useSWR from "swr";
import { getFrecuentAddress } from "@/src/services/book.service";

export const useFrecuentTravel = (userId?: string) => {
  const key = userId ? ["/user/frecuent_travel", userId] : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => {
      if (!userId) throw new Error("User ID is required");
      return getFrecuentAddress(userId);
    }
  );

  return {
    frecuentTravel: data,
    isLoading,
    error,
    mutateFrecuentTravel: mutate,
  };
};
