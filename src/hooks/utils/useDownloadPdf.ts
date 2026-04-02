import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { useAuth } from '@/src/context/auth.context';

export const useFileDownloader = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const { token } = useAuth();
  const downloadFromAPI = async (url: string, filename: string, extension: string) => {
    try {
      setIsDownloading(true);
      setStatusMessage('Descargando...');
      const file = `${filename}.${extension}`;
      const result = await FileSystem.downloadAsync(url, FileSystem.documentDirectory + file, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/pdf',
        },
      });

      setStatusMessage('Descarga completada con éxito. Guardando archivo...');
      await save(result.uri, file, result.headers['Content-Type']);
    } catch {
      setIsDownloading(false);
      setStatusMessage('Error en la descarga. Intentando de nuevo...');
      setErrorMessage('Hubo un problema descargando el archivo desde la API.');
    }
  };

  const save = async (uri: string, filename: string, mimetype: string) => {
    try {
      const finalMime = mimetype || 'application/pdf';
      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            filename,
            finalMime
          );

          await FileSystem.writeAsStringAsync(newFileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          setIsDownloading(false);
          setStatusMessage('Archivo guardado exitosamente.');
        } else {
          setIsDownloading(false);
          setStatusMessage('Permisos denegados, compartiendo archivo...');
          shareAsync(uri);
        }
      } else {
        setStatusMessage('Guardando archivo...');
        shareAsync(uri);
      }
    } catch {
      setIsDownloading(false);
      setStatusMessage('Error al guardar el archivo.');
      setErrorMessage('No se pudo guardar el archivo.');
    }
  };


  const shareAsync = async (uri: string) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        setStatusMessage('Compartiendo archivo...');
        await Sharing.shareAsync(uri);
        setStatusMessage('Archivo compartido con éxito.');
      } else {
        setErrorMessage('No se puede compartir el archivo en este dispositivo.');
        setStatusMessage('No se puede compartir el archivo en este dispositivo.');
      }
    } catch {
      setIsDownloading(false);
      setStatusMessage('Error al intentar compartir el archivo.');
      setErrorMessage('No se pudo compartir el archivo.');
    }
  };

  return {
    isDownloading,
    errorMessage,
    statusMessage,
    downloadFromAPI,
  };
};