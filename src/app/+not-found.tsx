import { StyleSheet, View } from "react-native";
import React from "react";
import { router } from "expo-router";
import { Text } from "@/src/components";
import { Button, ButtonText } from "@/src/components/ui/button";

export default function NotFoundScreen() {
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Page Not Found</Text>
        <Text style={styles.description}>
          The page you are looking for might have been removed or is temporarily
          unavailable.
        </Text>
        <Button style={styles.button} onPress={() => router.replace("/")}>
          <ButtonText>Go Home</ButtonText>
        </Button>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#343A40",
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 10,
    color: "#495057",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#868E96",
  },
  button: {
    paddingHorizontal: 20,
    height: 50,
    backgroundColor: "#0D6EFD",
    borderRadius: 5,
  },
});
