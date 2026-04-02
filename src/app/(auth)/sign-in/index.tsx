import { Keyboard, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Formik } from "formik";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Hop } from "@/assets/svg";
import { Text, Button, KeyboardContainer, Input, LinearGradient } from "@/src/components";
import { Box } from "@/src/components/ui/box";
import { VStack } from "@/src/components/ui/vstack";
import { useAuth } from "@/src/context/auth.context";
import { useToast } from "@/src/hooks";
import { getUserLogged, login } from "@/src/services/auth.service";
import { Colors } from "@/src/utils/constants/Colors";
import { AuthRoutesLink } from "@/src/utils/enum/auth.routes";
import { ErrorWithStatus } from "@/src/utils/interfaces/error.interface";
import validationSchema from "@/src/utils/schemas/login.schema";

export default function SignIn() {
  const { t } = useTranslation();
  const schema = validationSchema(t);
  const [loading, setLoading] = useState(false);
  const { setToken } = useAuth();
  const { showToast } = useToast();

  const storeTokens = async (token: string, refreshToken: string) => {

    setToken(token);

    await AsyncStorage.setItem("auth_token", JSON.stringify({ token, refreshToken }));
  };

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    Keyboard.dismiss();

    try {
      const { access_token, refresh_token } = await login(values);
      await storeTokens(access_token, refresh_token);
      const user = await getUserLogged();

      if (!user.isVerified) {
        router.replace({
          pathname: AuthRoutesLink.SIGN_UP,
          params: { step: 5, user_type: user.role, fromLogin: "true" },
        });
        return;
      }

      router.replace(
        user.status == "ACTIVE" ? "/(tabs)" : AuthRoutesLink.WAITING_VALIDATION
      );
    } catch (err: unknown) {
      handleLoginError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (err: unknown) => {
    if (err && typeof err === "object" && "status" in err) {
      const { status } = err as ErrorWithStatus;

      switch (status) {
        case 500:
          router.replace({
            pathname: "/error",
            params: {
              title: "Ups! Hubo un problema al intentar iniciar sesión",
              subtitle: "Por favor, intenta nuevamente más tarde.",
              buttonText: "Ir al inicio",
              // @ts-ignore
              buttonAction: () => router.replace("/(auth)/sign-in"),
            },
          });
          break;
        case 401:
        case 404:
          showToast({
            message: t("signin.login_error", { ns: "auth" }),
            action: "error",
            duration: 3000,
            placement: "bottom",
          });
          break;
        default:
      }
    }
  };

  return (
    <LinearGradient locations={[0, 0.3]} style={styles.wrapper}>
      <KeyboardContainer>
        <View style={styles.container}>
          <VStack space="lg" className="items-center mb-9 w-[100%]">
            <Hop color={Colors.SECONDARY} />
            <Text
              fontSize={28}
              fontWeight={600}
              textColor={Colors.DARK_GREEN}
              className="mt-12"
            >
              {t("signin.welcome", { ns: "auth" })}
            </Text>
            <Text fontSize={16} fontWeight={400} textAlign="center">
              {t("signin.sign_in_to_your_account", { ns: "auth" })}
            </Text>
          </VStack>
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={schema}
            onSubmit={handleLogin}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <>
                <VStack space="lg">
                  <Input
                    label={t("signin.email_label", { ns: "auth" })}
                    placeholder=""
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    value={values.email}
                    touched={touched.email}
                    error={touched.email && errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    isRequired
                  />

                  <Box className="gap-[8px]">
                    <Input
                      label={t("signin.password_label", { ns: "auth" })}
                      placeholder=""
                      secureTextEntry
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      value={values.password}
                      touched={touched.password}
                      error={touched.password && errors.password}
                      rightIcon
                      isRequired
                    />
                    <Text
                      textColor={Colors.DARK_GREEN}
                      underline
                      fontSize={14}
                      onPress={() =>
                        router.push(AuthRoutesLink.RECOVERY_PASSWORD)
                      }
                    >
                      {t("signin.forgot_password", { ns: "auth" })}
                    </Text>
                  </Box>
                </VStack>
                <VStack className="mt-28 gap-[20px]">
                  <Button onPress={() => handleSubmit()} loading={loading}>
                    {t("signin.sign_in_button", { ns: "auth" })}
                  </Button>
                  <Text fontSize={14} fontWeight={300} textAlign="center">
                    {t("signin.no_account", { ns: "auth" })}{" "}
                    <Text
                      fontWeight={600}
                      onPress={() => {
                        router.navigate(AuthRoutesLink.ONBOARDING);
                      }}
                    >
                      {t("signin.create_account", { ns: "auth" })}
                    </Text>
                  </Text>
                </VStack>
              </>
            )}
          </Formik>
        </View>
      </KeyboardContainer>
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
  },
});
