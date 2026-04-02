import * as Yup from 'yup';
import { i18NextType } from "@/src/utils/types/i18n.type";

const validationSchema = (t: i18NextType) => Yup.object({
  password: Yup.string().matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/,
    t("validations.signup.password.validate", { ns: 'auth' })),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], t('new_password.passwords_must_match'))
    .required(t('new_password.confirm_password_required')),
});

export default validationSchema;
