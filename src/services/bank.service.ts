import axios, { AxiosResponse } from "axios";
import axiosInstance from '@/src/axios/axios.config';
import { Bank } from "@/src/utils/types/bank.type";

export const getBanks = async (): Promise<Bank[]> => {
  try {
    const response: AxiosResponse<Bank[]> = await axiosInstance.get("/banks");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};