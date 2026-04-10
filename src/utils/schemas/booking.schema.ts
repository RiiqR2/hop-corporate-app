import * as Yup from 'yup';
import { i18NextType } from "@/src/utils/types/i18n.type";

export const validationSchema = (t: i18NextType) => Yup.object().shape({
  fullName: Yup.string()
    .min(2, t("validations.booking.fullNameTooShort", { ns: 'auth' }))
    .max(30, t("validations.booking.fullNameTooLong", { ns: 'auth' }))
    .required(t("validations.booking.fullName", { ns: 'auth' })),
  contact: Yup.string()
    .required(t("validations.booking.contact", { ns: 'auth' }))
    .matches(/^\d+$/, t("validations.booking.contact_invalid", { ns: 'auth' }))
    .min(8, t("validations.booking.contact_min", { ns: 'auth' }))
    .max(20, t("validations.booking.contact_max", { ns: 'auth' })),

  numberOfPassengers: Yup.number().required(t("validations.booking.passengers", { ns: 'auth' })),
  numberOfLuggages: Yup.number().required(t("validations.booking.luggages", { ns: 'auth' })),
});

export const validationSchemaPickup = (t: i18NextType) => Yup.object().shape({
  fullName: Yup.string()
    .min(2, t("validations.booking.fullNameTooShort", { ns: 'auth' }))
    .max(30, t("validations.booking.fullNameTooLong", { ns: 'auth' }))
    .required(t("validations.booking.fullName", { ns: 'auth' })),
  contact: Yup.string()
    .required(t("validations.booking.contact", { ns: 'auth' }))
    .matches(/^\d+$/, t("validations.booking.contact_invalid", { ns: 'auth' }))
    .min(8, t("validations.booking.contact_min", { ns: 'auth' }))
    .max(20, t("validations.booking.contact_max", { ns: 'auth' })),
  numberOfPassengers: Yup.number().required(t("validations.booking.passengers", { ns: 'auth' })),
  numberOfLuggages: Yup.number().required(t("validations.booking.luggages", { ns: 'auth' })),
});
