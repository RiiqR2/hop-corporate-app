import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    async function registerForPushNotifications() {
      if (!Device.isDevice) {
        alert("Las notificaciones solo funcionan en dispositivos físicos.");
        return;
      }

      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (status !== "granted") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        finalStatus = newStatus;
      }

      if (finalStatus !== "granted") {
        alert("No se otorgaron permisos para notificaciones.");
        return;
      }


      const tokenData: { data: string } = await Notifications.getExpoPushTokenAsync();
      setExpoPushToken(tokenData.data);
    }

    registerForPushNotifications();
  }, []);

  return expoPushToken;
}
