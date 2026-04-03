import { ActivityIndicator, StyleSheet, View, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AssetsImages } from "@/assets/images";
import { Hop } from "@/assets/svg";
import { Text, Button, LinearGradient } from "@/src/components";
import { VStack } from "@/src/components/ui/vstack";
import { useMe } from "@/src/hooks";
import { Colors } from "@/src/utils/constants/Colors";
import { AuthRoutesLink } from "@/src/utils/enum/auth.routes";

export default function FinishOnboarding() {
  const { t } = useTranslation();

  const { user } = useMe();
  
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!user) return;

    let timeout: NodeJS.Timeout;

    if (user.isVerified && user.status == "ACTIVE") {
      setLoading(true);
      timeout = setTimeout(() => {
        router.replace("/(tabs)");
      }, 2000);
    } else if (user.isVerified && user.status != "ACTIVE") {
      timeout = setTimeout(() => {
        router.replace(AuthRoutesLink.WAITING_VALIDATION);
      }, 2000);
    } else if (!user.isVerified && user.status != "ACTIVE") {
      router.replace({
        pathname: AuthRoutesLink.SIGN_IN
      });
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [user]);

  return (
    <LinearGradient>
      <View style={styles.container}>
        <VStack space="lg" className="items-center mb-9">
          <Hop color={Colors.SECONDARY} />
          <Text
            fontSize={28}
            textColor={Colors.DARK_PURPLE}
            fontWeight={600}
            textAlign="center"
          >
            {t("signup.finishOnboarding.header")}
          </Text>
        </VStack>
        <Image source={AssetsImages.onboardingSuccess} />
        <VStack space="lg" className="mt-28 gap-5">
          <Text fontSize={14} textAlign="center">
            {t("signup.finishOnboarding.description")}
          </Text>
        </VStack>
      </View>
      <View style={{ paddingBottom: insets.bottom }}>
        <Button onPress={() => { }} loading={loading}>
          <ActivityIndicator color={Colors.WHITE} />
        </Button>
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
    alignItems: "center",
  },
});
