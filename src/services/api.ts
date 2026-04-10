import axios from 'axios';
import { getAuthTokenString } from '@/src/auth/getAuthToken';

export const api = axios.create({
  baseURL: 'http://192.168.1.10:3000/api',
});

// Interceptor que agrega Bearer <token> si no viene puesto
api.interceptors.request.use(async (config: any) => {
  if (!config.headers?.Authorization) {
    const token = await getAuthTokenString();
    if (token) {
      config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
    }
  }
  return config;
});
