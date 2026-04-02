import axiosInstance from '@/src/axios/axios.config';

export type Presence = { online: boolean; updated_at?: string };

export async function getMyPresence(): Promise<Presence | null> {
  try {
    const { data } = await axiosInstance.get<Presence>('/user/me');
    return data;
  } catch (e: any) {
    console.log(e)
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

export async function setMyPresence(online: boolean): Promise<Presence> {
  const { data } = await axiosInstance.patch<Presence>('/user/me', { online });
  return data;
}
