import * as Yup from "yup";
import { i18NextType } from "../types/i18n.type";

export const validationSchema = (t: i18NextType) => Yup.object().shape({
  firstName: Yup.string()
    .min(2, t("validations.signup.firstName.min_length", { ns: 'auth' }))
    .max(20, t("validations.signup.firstName.max_length", { ns: 'auth' }))
    .required(t("validations.signup.firstName.required", { ns: 'auth' })),

  lastName: Yup.string()
    .min(2, t("validations.signup.lastName.min_length", { ns: 'auth' }))
    .max(20, t("validations.signup.lastName.max_length", { ns: 'auth' }))
    .required(t("validations.signup.lastName.required", { ns: 'auth' })),
  phone: Yup.string()
    .required(t("validations.booking.contact", { ns: 'auth' }))
    .matches(/^\d+$/, t("validations.booking.contact_invalid", { ns: 'auth' }))
    .min(8, t("validations.booking.contact_min", { ns: 'auth' }))
    .max(20, t("validations.booking.contact_max", { ns: 'auth' })),
  email: Yup.string()
    .required(t("validations.signup.email.required", { ns: 'auth' }))
    .test(
      "is-valid-email",
      t("validations.signup.email.invalid", { ns: 'auth' }),
      (value) =>
        !!value &&
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
    ),
  address: Yup.string()
    .min(2, t("validations.signup.address.min_length", { ns: "auth" }))
    .required(t("validations.signup.address.required", { ns: "auth" })),
});