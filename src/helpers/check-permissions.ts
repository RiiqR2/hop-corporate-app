import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";

export const checkAndRequestPermissions = async () => {
  const { status: cameraStatus } = await Camera.getCameraPermissionsAsync();
  const { status: mediaLibraryStatus } =
    await MediaLibrary.getPermissionsAsync();

  if (cameraStatus !== "granted") {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== "granted") {

      return false;
    }
  }

  if (mediaLibraryStatus !== "granted") {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      return false;
    }
  }

  return true;
};
