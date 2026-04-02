import * as Yup from 'yup';
import { i18NextType } from "@/src/utils/types/i18n.type";

const validationSchema = (t: i18NextType) => Yup.object({
  email: Yup.string()
    .email(t('validations.signin.email.invalid', { ns: 'auth' }))
    .required(t('validations.signin.email.required', { ns: 'auth' })),
});

export default validationSchema;
