import { StyleSheet, View, Image } from "react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { AssetsImages } from "@/assets/images";
import { Hop } from "@/assets/svg";
import { LinearGradient, Text, Button } from "@/src/components";
import { VStack } from "@/src/components/ui/vstack";
import { Colors } from "@/src/utils/constants/Colors";
import { AuthRoutesLink } from "@/src/utils/enum/auth.routes";

export default function FinishRecoverPassword() {
  const { t } = useTranslation();
  return (
    <LinearGradient>
      <View style={styles.container}>
        <VStack space="4xl" className="items-center mb-9">
          <Hop color={Colors.SECONDARY} />
          <Text
            fontSize={28}
            fontWeight={600}
            textAlign="center"
            textColor={Colors.DARK_GREEN}
          >
            {t("new_password.password_changed_successfully")}
          </Text>
        </VStack>
        <Image source={AssetsImages.success} />
        <VStack space="lg" className="mt-28 w-full">
          <Button
            onPress={() => {
              router.replace(AuthRoutesLink.SIGN_IN);
            }}
            stretch
          >
            {t("new_password.go_to_home")}
          </Button>
        </VStack>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingBottom: 24,
  },
  container: {
    paddingHorizontal: 16,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
