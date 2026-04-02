export enum AuthRoutes {
  ENTRY = 'index',
  SIGN_UP = 'sign-up/index',
  SIGN_IN = 'sign-in/index',
  FINISH_ONBOARDING = 'onboarding/finish-onboarding',
  WAITING_VALIDATION = 'validation/index',
  RECOVERY_PASSWORD = 'password/recovery-password',
  NEW_PASSWORD = 'password/new-password',
  FINISH_RECOVER_PASSWORD = 'password/finish-recover-password',
  MAP = 'map/index',
  ONBOARDING = 'onboarding/onboarding'
}

export enum AuthRoutesLink {
  ENTRY = '/',
  SIGN_UP = '/(auth)/sign-up',
  SIGN_IN = '/(auth)/sign-in',
  FINISH_ONBOARDING = '/(auth)/onboarding/finish-onboarding',
  WAITING_VALIDATION = '/(auth)/validation',
  RECOVERY_PASSWORD = '/(auth)/password/recovery-password',
  NEW_PASSWORD = '/(auth)/password/new-password',
  FINISH_RECOVER_PASSWORD = '/(auth)/password/finish-recover-password',
  MAP = '/(auth)/map',
  ONBOARDING = '/(auth)/onboarding/onboarding'
}