import { Pressable } from "react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { getPendingComission } from "@/src/services/book.service";
import { Colors } from "@/src/utils/constants/Colors";
import { Text } from "../text/text.component";
import { HStack } from "../ui/hstack";
import { EyeIcon, EyeOffIcon, Icon } from "../ui/icon";

export const Balance = ({ id }: { id: string }) => {
  const { t } = useTranslation();
  const [showBalance, setShowBalance] = useState(false);
  const { data: commissions } = useSWR("user/commissions", () => getPendingComission(id!), {
    revalidateOnMount: true,
    refreshInterval: 5000
  });

  return (
    <HStack space="md" className="items-center">
      <Text
        className="mr-4"
        fontSize={14}
        fontWeight={400}
        textColor={Colors.DARK_GREEN}
      >
        {t("home.balance", { ns: "home" })}:{" "}
        <Text fontSize={20} fontWeight={600}>
          {showBalance ? `$${commissions?.totalcommission?.toFixed(2) || 0}` : "••••••••••••"}
        </Text>
      </Text>
      <Pressable onPress={() => setShowBalance(!showBalance)}>
        {showBalance ? (
          <Icon as={EyeOffIcon} className="w-4 h-4" color={Colors.DARK_GREEN} />
        ) : (
          <Icon as={EyeIcon} className="w-4 h-4" color={Colors.DARK_GREEN} />
        )}
      </Pressable>
    </HStack>
  );
};
