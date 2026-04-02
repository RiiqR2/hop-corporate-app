//import * as Sentry from 'sentry-expo';
import axios, { AxiosResponse } from "axios";
import axiosInstance from '@/src/axios/axios.config';
import {
  SignInPayload,
  SignInResponse,
  User,
  UserDocumentsPayload,
  UserInfo,
  VehicleUser,
} from "@/src/utils/interfaces/auth.interface";


export const createUser = async (userData: Partial<User & UserInfo>): Promise<User> => {
  try {
    const response: AxiosResponse = await axiosInstance.post("/user", userData);
    return response.data;
  } catch (error: unknown) {
    //Sentry.Native.captureException(error);
    if (axios.isAxiosError(error)) throw error.response || error;
    throw error;
  }
};

export const getUser = async (): Promise<Omit<User, "userDocument">> => {
  try {
    const response: AxiosResponse = await axiosInstance.get("/user");
    return response.data;
  } catch (error: unknown) {
    //Sentry.Native.captureException(error);
    if (axios.isAxiosError(error)) throw error.response || error;
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    await axiosInstance.delete(`/user/${id}`);
  } catch (error) {
    //Sentry.Native.captureException(error);
    if (axios.isAxiosError(error)) throw error.response || error;
    throw error;
  }
};

export const login = async (credentials: SignInPayload): Promise<SignInResponse> => {
  try {
    const response: AxiosResponse = await axiosInstance.post("/auth/login", credentials);
    return response.data;
  } catch (error: unknown) {
    //Sentry.Native.captureException(error);
    if (axios.isAxiosError(error)) throw error.response || error;
    throw error;
  }
};

export const refreshToken = async (): Promise<AxiosResponse> => {
  try {
    const response: AxiosResponse = await axiosInstance.get("/auth/refresh");
    return response.data;
  } catch (error: unknown) {
    //Sentry.Native.captureException(error);
    if (axios.isAxiosError(error)) throw error.response || error;
    throw error;
  }
};

export const recoveryPassword = async (email: string): Promise<AxiosResponse> => {
  try {
    const response: AxiosResponse = await axiosInstance.post("/mail/recoveryPassword", { email });
    return response.data;
  } catch (error: unknown) {
    //Sentry.Native.captureException(error);
    if (axios.isAxiosError(error)) throw error.response || error;
    throw error;
  }
};

export const getUserLogged = async (): Promise<User> => {
  try {
    const response: AxiosResponse = await axiosInstance.get("/user/logged");
    return response.data;
  } catch (error: unknown) {
    //Sentry.Native.captureException(error);
    if (axios.isAxiosError(error)) throw error.response || error;
    throw error;
  }
};

export const updateUser = async (id: string, data: Partial<UserInfo>): Promise<User> => {
  try {
    const response: AxiosResponse = await axiosInstance.put(`/user-info/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    //Sentry.Native.captureException(error);
    if (axios.isAxiosError(error)) throw error.response || error;
    throw error;
  }
};

export const updateUserOne = async (id: string, data: Partial<User>): Promise<User> => {
  try {
    const response: AxiosResponse = await axiosInstance.put(`/user/one/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    //Sentry.Native.captureException(error);
    if (axios.isAxiosError(error)) throw error.response || error;
    throw error;
  }
};

export const getUserById = async (id: string): Promise<Omit<User, "userDocument">> => {
  try {
    const response: AxiosResponse = await axiosInstance.get(`/user/one/${id}`);
    return response.data;
  } catch (error: unknown) {
    //Sentry.Native.captureException(error);
    if (axios.isAxiosError(error)) throw error.response || error;
    throw error;
  }
};

export const updateVehicleUser = async (id: string, data: VehicleUser): Promise<User> => {
  try {
    const response: AxiosResponse = await axiosInstance.patch(`/user-vehicle/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    //Sentry.Native.captureException(error);
    if (axios.isAxiosError(error)) throw error.response || error;
    throw error;
  }
};

export const updateUserDocuments = async (id: string, data: Partial<UserDocumentsPayload>): Promise<void> => {
  try {
    const uploadDocument = async (documentType: string, files: { uri: string; type?: string; name?: string }[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("file", {
          uri: file.uri,
          type: file.type || "image/jpeg",
          name: file.name || "file.jpg",
        } as any);
      });
      formData.append("document", documentType);

      try {
        const response = await axiosInstance.patch(`/user-documents/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000,
        });
        return response.status;
      } catch (error: unknown) {
        //Sentry.Native.captureException(error);
        if (axios.isAxiosError(error)) throw error.response || error;
        throw error;
      }
    };

    const uploadPromises: Promise<any>[] = [];
    if (data.vehiclePictures) uploadPromises.push(uploadDocument("vehiclePictures", data.vehiclePictures));
    if (data.identificationPictures) uploadPromises.push(uploadDocument("identificationPictures", data.identificationPictures));
    if (data.circulationPermit) uploadPromises.push(uploadDocument("circulationPermit", data.circulationPermit));
    if (data.seremiDecree) uploadPromises.push(uploadDocument("seremiDecree", data.seremiDecree));
    if (data.driverResume) uploadPromises.push(uploadDocument("driverResume", data.driverResume));
    if (data.passengerInsurance) uploadPromises.push(uploadDocument("passengerInsurance", data.passengerInsurance));

    await Promise.all(uploadPromises);
  } catch (error) {
    //Sentry.Native.captureException(error);
    throw error;
  }
};

export const verifyEmail = async (email: string) => {
  try {
    const response: AxiosResponse = await axiosInstance.get(`/user/email/${email}`);
    return response.data;
  } catch (error: unknown) {
    //Sentry.Native.captureException(error);
    if (axios.isAxiosError(error)) throw error.response || error;
    throw error;
  }
};