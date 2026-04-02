// src/services/fixedDestination.service.ts
import axios from "axios";
import axiosInstance from "@/src/axios/axios.config";

export interface FixedDestination {
  id?: string;
  name?: string;
  type?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  description?: string
}

export const getFixedDestinations = async (
  type?: string
): Promise<FixedDestination[]> => {
  try {
    const response = await axiosInstance.get<FixedDestination[]>(
      "/fixed-destination",
      {
        params: type ? { type } : {},
      }
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || error.message;
    }
    throw error;
  }
};
