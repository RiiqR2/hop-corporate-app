import useSWR from "swr";
import { getTravels } from "@/src/services/book.service";
import { BookingResponse } from "@/src/utils/interfaces/booking.interface";

export const useTravelsBooking = () => {
  const { data, mutate, error, isLoading } = useSWR<BookingResponse[]>(
    "/travels/booking",
    getTravels
  );

  return {
    travels: data,
    isLoading,
    error,
    mutateTravels: mutate,
  };
};
