import axios, { AxiosResponse } from "axios";
import axiosInstance from '@/src/axios/axios.config';
import { travelStatus } from "@/src/utils/enum/travel.enum";
import {
  BookingPagination,
  BookingResponse,
  CommissionData,
  FrecuentAddressInterface,
  OrderBook,
} from "@/src/utils/interfaces/booking.interface";

export const createTravel = async (
  travelData: Partial<BookingResponse>,
): Promise<BookingResponse> => {
  try {
    const response: AxiosResponse<BookingResponse> =
      await axiosInstance.post("/travels", travelData);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};

export const getTravels = async (
  id?: string,
  type?: "passenger",
  booking?: boolean,
  history?: boolean,
  page: number = 0,
  itemsPerPage: number = 10,
  statusTravel?: travelStatus,
  order: "ASC" | "DESC" = "ASC"
): Promise<BookingPagination> => {
  try {
    const queryParams = new URLSearchParams({
      ...(type === "passenger" && { passenger: id }),
      ...(booking && { booking: String(booking) }),
      ...(history && { history: String(history) }),
      ...(statusTravel && { status: String(statusTravel) }),
      order,
      page: String(page),
      itemsPerPage: String(itemsPerPage),
    });

    const response: AxiosResponse<BookingPagination> =
      await axiosInstance.get(`/travels?${queryParams.toString()}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};

export const getTravelHistory = async (): Promise<any[]> => {
  try {
    const response: AxiosResponse<any[]> =
      await axiosInstance.get("/travels/history");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};

export const getTravelById = async (id: string): Promise<BookingResponse> => {
  try {
    const response: AxiosResponse<BookingResponse> =
      await axiosInstance.get(`/travels/one/${id}`);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};

export const updateTravel = async (
  id: string,
  travelData: any,
): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosInstance.patch(
      `/travels/${id}`,
      travelData,
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};

export const deleteTravel = async (id: string): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axiosInstance.delete(
      `/ travels / ${id}`,
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};

export const getFrecuentAddress = async (id: string): Promise<FrecuentAddressInterface> => {
  try {
    const response: AxiosResponse<FrecuentAddressInterface> = await axiosInstance.get(`/travels/frecuentAddress?passenger=${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};

export const confirmPayment = async (gateway: string, travelId: string) => {
  try {
    const response = await axiosInstance.get(`/travels/confirmPayment?gateway=${gateway}&travel=${travelId}`);

    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};

export const getMercadoPagoPayment = async (travelId: string): Promise<OrderBook> => {
  try {
    const response = await axiosInstance.get(`/travels/mercadopago-payment/${travelId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};

export const cashPayment = async (travelId: string): Promise<OrderBook> => {
  try {
    const response = await axiosInstance.get(`/travels/cash-payment/${travelId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};

export const sendWhatsAppLinkTravel = async (id: string): Promise<any> => {
  try {
    if (!id) {
      throw new Error("ID inválido");
    }

    const response = await axiosInstance.get(
      `/travels/whatsapp-paymentLink?travel=${id}`,
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }

    throw error;
  }
};


export const getPendingComission = async (id: string): Promise<{ totalcommission: number }> => {
  try {
    const response: AxiosResponse<any> = await axiosInstance.get(
      `/travels/pending-commissions/${id}`,
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }

};

export const getComissions = async (id: string, year: number, month: number): Promise<CommissionData> => {
  try {
    const response: AxiosResponse<CommissionData> = await axiosInstance.get(`/travels/commissions/${id}?year=${year}&month=${month}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};

export const getCosts = async (id: string, year: number, month: number): Promise<CommissionData> => {
  try {
    const response: AxiosResponse<CommissionData> = await axiosInstance.get(`/travels/costs/${id}?year=${year}&month=${month}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};

export const notifyDriverOnStartPoint = async (travelId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/travels/driver-on-start-point?travel=${travelId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response || error;
    }
    throw error;
  }
};
