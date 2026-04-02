import { i18NextType } from "@/src/utils/types/i18n.type";

export const documentationHopper = (t: i18NextType) => ([
  {
    name: "seremi",
    value: t("signup.step_3.fields.seremi"),
    type: "pdf"
  },
  {
    name: "curriculum_vitae",
    value: t("signup.step_3.fields.curriculum_vitae"),
    type: "pdf"
  },
  {
    name: "permission",
    value: t("signup.step_3.fields.permission"),
    type: "pdf"
  },
  {
    name: "secure",
    value: t("signup.step_3.fields.secure"),
    type: "pdf"
  },
  {
    name: "vehicle_picture",
    value: t("signup.step_3.fields.vehicle_picture"),
    type: "png",
    info: t("tooltip_description", { ns: 'utils' })
  },
  {
    name: "identification_picture",
    value: t("signup.step_3.fields.identification_picture"),
    type: "png",
    info: t("tooltip_identity_description", { ns: 'utils' })
  }
]);