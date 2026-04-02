import useSWR from "swr";
import { getComissions } from "@/src/services/book.service";

interface DataUser {
  id: string;
}

export const useUserComissions = (
  dataUser?: DataUser,
  currentYear?: number,
  currentMonth?: number
) => {
  const key = dataUser ? ["/user/comissions", dataUser.id, currentYear, currentMonth] : null;

  const { data, error, mutate, isLoading } = useSWR(
    key,
    () => {
      if (!dataUser || currentYear === undefined || currentMonth === undefined) {
        throw new Error("Missing parameters");
      }
      return getComissions(dataUser.id, currentYear, currentMonth + 1);
    }
  );

  return {
    userComissions: data,
    isLoading,
    error,
    mutateComissions: mutate,
  };
};
