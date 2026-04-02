import axios, { AxiosResponse } from "axios";
import axiosInstance from '@/src/axios/axios.config';
import { User, UserDocument } from "@/src/utils/interfaces/auth.interface";
import { VehicleResponse } from "@/src/utils/types/vehicle";

type File = {
  uri: string;
  type?: string;
  name?: string;
}

export interface TermsConditionsConfig {
  id: string;
  hopperTermsConditions: string;
  hoppyTermsConditions: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}


export const uploadPicture = async (id: string, file: File): Promise<User> => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.type || "image/jpeg",
      name: file.name || "file.jpg",
    } as any);

    const response: AxiosResponse<User> = await axiosInstance.patch(
      `/user-info/profilepic/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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

export const updateUserData = async (id: string, data: Partial<User>): Promise<User> => {
  try {
    const response: AxiosResponse = await axiosInstance.put(`/user/one/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};

export const resetPassword = async (password: string, token: string) => {
  try {
    const response: AxiosResponse = await axiosInstance.put(`/user/changePassword`, {
      password
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};

export const getVehicleData = async (id: string): Promise<VehicleResponse> => {
  try {
    const response: AxiosResponse = await axiosInstance.get(`/user-vehicle/user/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};

export const getUserDocumentation = async (id: string): Promise<UserDocument> => {
  try {
    const response: AxiosResponse = await axiosInstance.get(`/user-documents/user/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};

export const getTermsAndConditions = async (): Promise<TermsConditionsConfig> => {
  try {
    const response: AxiosResponse = await axiosInstance.get(`/app-config`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};
