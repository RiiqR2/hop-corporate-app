import { i18NextType } from "@/src/utils/types/i18n.type";

export const translateVehicles = (t: i18NextType) => {

  return vehicles.map(vehicle => ({
    ...vehicle,
    value: t(`vehicles.${vehicle.type}`, { ns: 'utils' }),
    luggageSpace: t(`vehicles.${vehicle.specialLuggage}`, { ns: 'utils' }),
    specialLuggage: vehicle.specialLuggage === "si" || vehicle.specialLuggage === "yes"
      ? t(`vehicles.yes`, { ns: 'utils' })
      : t(`vehicles.yes`, { ns: 'utils' })
  }));
};

export const vehicles = [
  {
    type: "SEDAN",
    value: "Sedán",
    passengers: "4",
    luggageSpace: "1-3 Bultos",
    specialLuggage: "no",
  },
  {
    type: "ELECTRIC",
    value: "Electrico",
    passengers: "4",
    luggageSpace: "1-3 Bultos",
    specialLuggage: "no",
  },
  {
    type: "SUV",
    value: "Suv",
    passengers: "4",
    luggageSpace: "1-3 Bultos",
    specialLuggage: "no",
  },
  {
    type: "VANS",
    value: "Van",
    passengers: "7",
    luggageSpace: "4+ Bultos",
    specialLuggage: "si",
  },
];
