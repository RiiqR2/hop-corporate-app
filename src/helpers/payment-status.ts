import { ClockCustom, SuccessRounded, Warning } from "@/assets/svg";
import { Colors } from "@/src/utils/constants/Colors";
import { paymentStatus } from "@/src/utils/enum/payment.enum";
import { travelStatus } from "@/src/utils/enum/travel.enum";
import { i18NextType } from "@/src/utils/types/i18n.type";

export const payment = (t: i18NextType): Record<paymentStatus, string> => ({
  CANCELLED: t("booking.paymentStatus.CANCELLED", { ns: 'booking' }),
  DONE: t("booking.paymentStatus.DONE", { ns: 'booking' }),
  PENDING: t("booking.paymentStatus.PENDING", { ns: 'booking' }),
  FINISHED: t("booking.paymentStatus.FINISHED", { ns: 'booking' }),
});

export const travelStatusTranslated = (t: i18NextType): Record<travelStatus, string> => ({
  [travelStatus.ACCEPT]: t("booking.paymentStatus.ACCEPT", { ns: 'booking' }),
  [travelStatus.REQUEST]: t("booking.paymentStatus.PENDING", { ns: 'booking' }),
  [travelStatus.START]: "",
  [travelStatus.END]: "",
  [travelStatus.CANCELLED]: "",
});

export const paymentColor: Record<paymentStatus, string> = {
  CANCELLED: Colors.ERROR,
  DONE: Colors.PRIMARY,
  PENDING: Colors.LIGHT_YELLOW,
  FINISHED: Colors.PRIMARY,
};

export const travelStatusColor: Record<travelStatus, string> = {
  [travelStatus.ACCEPT]: Colors.PRIMARY,
  [travelStatus.REQUEST]: Colors.LIGHT_YELLOW,
  [travelStatus.START]: "",
  [travelStatus.END]: "",
  [travelStatus.CANCELLED]: "",
};

export const paymentTextColor: Record<paymentStatus, string> = {
  CANCELLED: Colors.LIGHT_RED,
  DONE: Colors.DARK_PURPLE,
  PENDING: Colors.YELLOW,
  FINISHED: Colors.PRIMARY,
};

export const paymentIcon: Record<paymentStatus, React.FC> = {
  CANCELLED: Warning,
  DONE: SuccessRounded,
  PENDING: ClockCustom,
  FINISHED: SuccessRounded,
};