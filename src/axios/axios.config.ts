import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/config";

// Interfaz extendida para permitir la propiedad _retry
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

let isRefreshing = false;
let failedRequestsQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

// Limitar logs excesivos
let lastTokenLog = 0;
const TOKEN_LOG_INTERVAL = 5000; // 5 segundos entre logs

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const jsonValue = await AsyncStorage.getItem("auth_token");
      if (jsonValue) {
        try {
          const tokenData = JSON.parse(jsonValue);
          if (tokenData?.token) {
            config.headers["Authorization"] =
              `Bearer ${tokenData.token}`;
            config.headers["origin-login"] = "app";

            // Limitar logs para evitar spam
            if (
              __DEV__ &&
              Date.now() - lastTokenLog > TOKEN_LOG_INTERVAL
            ) {
              lastTokenLog = Date.now();
            }
          }
        } catch {
          await AsyncStorage.removeItem("auth_token");
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error en interceptor de solicitud:", error);
    }

    return config;
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    const isAuthRequest =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokenValue = await AsyncStorage.getItem("auth_token");
        if (!tokenValue) {
          throw new Error("No hay token almacenado");
        }

        let parsed;
        try {
          parsed = JSON.parse(tokenValue);
        } catch {
          throw new Error("Token inválido en formato");
        }

        if (!parsed?.refreshToken) {
          throw new Error("Refresh token faltante");
        }

        const refreshResponse = await axios.get(
          `${API_URL}/auth/refresh`,
          {
            headers: {
              Authorization: `Bearer ${parsed.refreshToken}`,
            },
          },
        );

        const { token, refreshToken } = refreshResponse.data;

        await AsyncStorage.setItem(
          "auth_token",
          JSON.stringify({ token, refreshToken }),
        );

        failedRequestsQueue.forEach(({ resolve }) => resolve());
        failedRequestsQueue = [];

        return axiosInstance(originalRequest);
      } catch (refreshError) {

        failedRequestsQueue.forEach(({ reject }) =>
          reject(refreshError),
        );
        failedRequestsQueue = [];

        await AsyncStorage.removeItem("auth_token");

        return Promise.reject(
          new Error("Sesión expirada. Inicie sesión nuevamente"),
        );
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
