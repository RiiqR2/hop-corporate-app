import { StyleSheet, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeftRounded } from "@/assets/svg";
import { KeyboardContainer, Text, LinearGradient } from "@/src/components";
import { Step1, Step3, Step4 } from "@/src/components/forms/register";
import { Fab, FabIcon } from "@/src/components/ui/fab";
import { VStack } from "@/src/components/ui/vstack";
import { useAuth } from "@/src/context/auth.context";
import { Colors } from "@/src/utils/constants/Colors";
import { OnboardingPayload } from "@/src/utils/interfaces/auth.interface";
import { i18NextType } from "@/src/utils/types/i18n.type";

export default function SignUp() {
  const queryParams = useRoute().params as any;
  const { t } = useTranslation();
  const [step, setStep] = useState(
    queryParams.step ? Number(queryParams.step) : 1
  );

  const [id, setId] = useState("");
  const { state } = useAuth();
  const insets = useSafeAreaInsets();

  const [payload, setPayload] = useState<OnboardingPayload | null>({
    email: "",
    password: "",
    role: "USER_PASSENGER",
    firstName: "",
    lastName: "",
    rut: "",
    phone: "",
    countryCode: "",
    user_address: {
      address: "",
      latitude: 0,
      longitude: 0,
    },
    bank_name: "",
    bank_account: "",
    bank_account_type: "",
    bank_account_rut: "",
    bank_account_number: "",
    bank_account_holder: "",
    reference_code: "",
    hotel_address: {
      hotel_name: "",
      address: "",
      latitude: 0,
      longitude: 0,
    },
    birthdate: "",
    vehicleDocs: {
      identification_picture: "",
      vehicle_picture: "",
      seremi: "",
      curriculum_vitae: "",
      permission: "",
      secure: "",
    },
    vehicleData: {
      type: '',
      passengers: '',
      luggageSpace: '',
      specialLuggage: '',
      accessibility: '',
    }
  });


  const accumulatePayload = (newData: any) => {
    setPayload((prev) => {
      const merged = { ...prev, ...newData };
      return merged;
    });
  };

  const role = "USER_PASSENGER";

  const steps = [
    Step1,
    Step3,
    Step4,
  ];

  const renderStep = () => {
    const safeStep = Math.min(Math.max(step, 1), steps.length);
    const StepComponent = steps[safeStep - 1];
    const payloadCompleted = {
      email: payload?.email || '',
      password: payload?.password || '',
      phone: payload?.phone || '',
      countryCode: payload?.countryCode || '',
      role: role,
      userInfo: {
        firstName: payload?.firstName || '',
        lastName: payload?.lastName || '',
        rut: payload?.rut || '',
        phone: payload?.phone || '',
        user_address: {
          address: state.user_info.address,
          latitude: state.user_info.latitude,
          longitude: state.user_info.longitude,
        },
        bank_name: payload?.bank_name || '',
        bank_account_holder: payload?.bank_account_holder || '',
        bank_account_type: payload?.bank_account_type || '',
        bank_account_rut: payload?.bank_account_rut || '',
        bank_account: payload?.bank_account || '',
        birthdate: payload?.birthdate || '',
        reference_code: payload?.reference_code || '',
        hotel_address: {
          name: payload?.hotel_address.hotel_name || '',
          address: state.hotel_info.address,
          latitude: state.hotel_info.latitude,
          longitude: state.hotel_info.longitude,
        },
      },
      vehicleDocs: {
        identification_picture: payload?.vehicleDocs.identification_picture || '',
        vehicle_picture: payload?.vehicleDocs.vehicle_picture || '',
        seremi: payload?.vehicleDocs.seremi || '',
        curriculum_vitae: payload?.vehicleDocs.curriculum_vitae || '',
        permission: payload?.vehicleDocs.permission || '',
        secure: payload?.vehicleDocs.secure || '',
      },
      vehicleData: {
        type: payload?.vehicleData.type || '',
        passengers: payload?.vehicleData.passengers || '',
        luggageSpace: payload?.vehicleData.luggageSpace || '',
        specialLuggage: payload?.vehicleData.specialLuggage || '',
        accessibility: payload?.vehicleData.accessibility || '',
      }
    };
    return (
      <StepComponent
        setStep={setStep}
        payload={accumulatePayload}
        clearPayload={() => setPayload(null)}
        payloadValues={payloadCompleted}
        extraData={id}
        setId={setId}
        role={role}
      />
    );
  };

  const getStepMessage = (step: number, t: i18NextType) => {
    if (step === 3) {
      return t("signup.step_message_final");
    }

    return t("signup.step_message");
  };

  const message = getStepMessage(step, t);

  const totalSteps = 3;

  return (
    <LinearGradient locations={[0, 0.3]}>
      {!(step === 1 || step === totalSteps) ? (
        <Fab
          placement="top left"
          onPress={() => setStep(step === 1 ? step : step - 1)}
          className="bg-[#E3E1F5] w-[24px] h-[24px]"
          style={{
            marginTop: insets.top,
          }}
        >
          <FabIcon as={ArrowLeftRounded} width={30} />
        </Fab>
      ) : (
        <></>
      )}
      <KeyboardContainer>
        <View style={styles.container}>
          <View style={styles.header}>
            <VStack space="xs" className="items-center mb-6">
              <Text
                fontSize={28}
                textColor={Colors.DARK_PURPLE}
                fontWeight={600}
              >
                {t("signup.title", { ns: "auth" })}
              </Text>
            </VStack>
            <Text fontSize={14} fontWeight={400} textAlign="center">
              {message}
            </Text>
          </View>
          <View style={styles.formulary_container}>
            <Text fontWeight={600} fontSize={14}>
              {t("signup.step_label", { step: step, totalSteps: totalSteps })}
            </Text>
            {renderStep()}
          </View>
        </View>
      </KeyboardContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginVertical: "auto",
    position: "relative",
  },
  header: {
    marginBottom: 24,
  },
  formulary_container: {
    gap: 12,
  },
});
