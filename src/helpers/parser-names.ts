import { TFunction } from "i18next";
import { travelTypeValues } from "@/src/utils/enum/travel.enum";
import { i18NextType } from "@/src/utils/types/i18n.type";

export const travelType = (t: TFunction): Record<travelTypeValues, string> => ({
  PICKUP: t("travelStatus.pickup", { ns: 'utils' }),
  DROPOFF: t("travelStatus.dropoff", { ns: 'utils' }),
  PROGRAMED: t("travelStatus.programmed", { ns: 'utils' }),
  INSTANT: t("travelStatus.instant", { ns: 'utils' }),
});

export const vehicleName = (t: i18NextType): { [key: string]: string } => ({
  SEDAN: t("home.map_home.third_sheet.vehicle.sedan.title", { ns: "home" }),
  VANS: t("home.map_home.third_sheet.vehicle.van.title", { ns: "home" }),
  ELECTRIC: t("home.map_home.third_sheet.vehicle.electric_car.title", { ns: "home" }),
  SUV: t("home.map_home.third_sheet.vehicle.suv.title", { ns: "home" })
});

export const reversedVehicleName: { [key: string]: string } = Object.fromEntries(
  Object.entries(vehicleName).map(([key, value]) => [value, key])
);
