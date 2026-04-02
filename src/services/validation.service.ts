import axios, { AxiosResponse } from "axios";
import axiosInstance from '@/src/axios/axios.config';

export interface MetamapWebhookPayload {
  event: string;
  verification: {
    id: string;
    status: string;
    result: {
      details: Record<string, any>;
      decision: string;
    };
    documents?: {
      type: string;
      country: string;
      fields: Record<string, any>;
    }[];
    verificationType: string;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: string;
  };
}

export const sendWebhookData = async (
  payload: MetamapWebhookPayload
): Promise<AxiosResponse> => {
  try {
    const response: AxiosResponse = await axiosInstance.post(
      "/user/webhook",
      payload
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};
