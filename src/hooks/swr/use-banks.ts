import useSWR from "swr";
import { getBanks } from "@/src/services/bank.service";
import { Bank } from "@/src/utils/types/bank.type";

export const useBanks = () => {
  const { data, isLoading, error, mutate } = useSWR<Bank[]>("/banks", getBanks);

  return {
    banks: data,
    isLoading,
    error,
    mutateBanks: mutate,
  };
};
