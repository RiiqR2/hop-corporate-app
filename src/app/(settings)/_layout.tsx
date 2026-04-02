// app/settings/_layout.tsx
import React from "react";
import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack initialRouteName="index" screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="account_state" />
      <Stack.Screen name="report_issue" />
    </Stack>
  );
}
