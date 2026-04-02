import useSWR from "swr";
import { getTravelById } from "@/src/services/book.service";
import { BookingResponse } from "@/src/utils/interfaces/booking.interface";

export const useTravelById = (id: string) => {
  const shouldFetch = Boolean(id);

  const { data, mutate, error, isLoading } = useSWR<BookingResponse>(
    shouldFetch ? "/travel/one" : null,
    () => getTravelById(id),
    { revalidateOnMount: true }
  );

  return {
    travel: data,
    isLoading,
    error,
    mutate,
  };
};
