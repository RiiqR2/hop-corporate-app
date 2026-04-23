import * as Yup from "yup";
import { isValidRUT } from "@/src/helpers/validate-rut";
import { i18NextType } from "@/src/utils/types/i18n.type";

export const validationSchema = (t: i18NextType) => Yup.object().shape({
  firstName: Yup.string()
    .min(2, t("validations.signup.firstName.min_length", { ns: 'auth' }))
    .max(20, t("validations.signup.firstName.max_length", { ns: 'auth' }))
    .required(t("validations.signup.firstName.required", { ns: 'auth' })),

  lastName: Yup.string()
    .min(2, t("validations.signup.lastName.min_length", { ns: 'auth' }))
    .max(20, t("validations.signup.lastName.max_length", { ns: 'auth' }))
    .required(t("validations.signup.lastName.required", { ns: 'auth' })),
  contact: Yup.string()
    //.required(t("validations.booking.contact", { ns: 'auth' }))
    //.matches(/^\d+$/, t("validations.booking.contact_invalid", { ns: 'auth' }))
    .min(6, t("validations.booking.contact_min", { ns: 'auth' }))
    .max(20, t("validations.booking.contact_max", { ns: 'auth' })),
  password: Yup.string().matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/,
    t("validations.signup.password.validate", { ns: 'auth' }))
    .required(t("validations.signup.password.required", { ns: 'auth' })),

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
    //.required(t("validations.signup.address.required", { ns: "auth" })),
});

export const validationSchemaS1 = (t: i18NextType) =>
  Yup.object().shape({
    bank_account_holder: Yup.string()
      .required(
        t("validations.step_2.bank_account_holder.required", {
          ns: "auth",
        })
      )
      .min(
        3,
        t("validations.step_2.bank_account_holder.min_length", {
          ns: "auth",
        })
      )
      .max(100, t("validations.step_2.bank_account_holder.max_length")),

    bank_name: Yup.object({
      name: Yup.string()
        .required(t("validations.step_2.bank_name.required", { ns: "auth" }))
        .min(3, t("validations.step_2.bank_name.min_length", { ns: "auth" })),
    }),


    bank_account: Yup.string()
      .required(
        t("validations.step_2.bank_account_number.required", {
          ns: "auth",
        })
      )
      .min(
        8,
        t("validations.step_2.bank_account_number.min_length", {
          ns: "auth",
        })
      )
      .max(
        20,
        t("validations.step_2.bank_account_number.max_length", {
          ns: "auth",
        })
      ),

    bank_account_type: Yup.string().required(
      t("validations.step_2.bank_account_type.required", { ns: "auth" })
    ),
    bank_account_rut: Yup.string()
      .required(
        t("validations.step_2.bank_account_rut.required", {
          ns: "auth",
        })
      )
      .test(
        "is-valid-rut",
        t("validations.signup.rut.validate", { ns: "auth" }),
        (value) => !value || isValidRUT(value)
      ),
  });

export const validationSchemaS3 = (t: i18NextType) =>
  Yup.object().shape({
    reference_code:Yup.string()
      .max(10, t("validations.step_3.reference_code.max", { ns: "auth" })),

    hotel_name: Yup.string()
      .min(2, t("validations.step_3.hotel_name.min", { ns: "auth" }))
      .max(50, t("validations.step_3.hotel_name.max", { ns: "auth" }))
      .required(
        t("validations.step_3.hotel_name.required", { ns: "auth" })
      ),

    home_address: Yup.string().required(
      t("validations.step_3.address.required", { ns: "auth" })
    ),
  });

export const validationSchemaS4 = (t: i18NextType) =>
  Yup.object().shape({
    type: Yup.string().required(
      t("validations.step_4.type", { ns: "auth" })
    ),
    passengers: Yup.string().required(
      t("validations.step_4.passengers", { ns: "auth" })
    ),
    accessibility: Yup.string().required(
      t("validations.step_4.accessibility", { ns: "auth" })
    ),
    luggageSpace: Yup.string().required(
      t("validations.step_4.luggageSpace", { ns: "auth" })
    ),
    specialLuggage: Yup.string().required(
      t("validations.step_4.specialLuggage", { ns: "auth" })
    ),
  });