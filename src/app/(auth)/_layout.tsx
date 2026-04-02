import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Stack } from 'expo-router';
import { AuthRoutes } from '@/src/utils/enum/auth.routes';

export default function _layout() {
  return (
    <>
      <StatusBar translucent style="dark" />
      <Stack>
        {[
          AuthRoutes.ENTRY,
          AuthRoutes.SIGN_UP,
          AuthRoutes.SIGN_IN,
          AuthRoutes.FINISH_ONBOARDING,
          AuthRoutes.WAITING_VALIDATION,
          AuthRoutes.RECOVERY_PASSWORD,
          AuthRoutes.NEW_PASSWORD,
          AuthRoutes.FINISH_RECOVER_PASSWORD,
          AuthRoutes.MAP,
          AuthRoutes.ONBOARDING,
        ].map((route) => (
          <Stack.Screen key={route} name={route} options={{ headerShown: false }} />
        ))}
      </Stack>
    </>
  );
}
