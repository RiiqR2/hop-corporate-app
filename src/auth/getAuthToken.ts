import AsyncStorage from '@react-native-async-storage/async-storage';

// Devuelve el Bearer token como string, o null
export async function getAuthTokenString(): Promise<string | null> {
  const saved = await AsyncStorage.getItem('auth_token');
  if (!saved) return null;
  try {
    const obj = JSON.parse(saved);
    if (obj && typeof obj === 'object' && typeof obj.token === 'string') {
      return obj.token;
    }
  } catch {
    // era un string plano
  }
  return saved;
}
