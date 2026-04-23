export default {
  expo: {
    name: 'Hop Business',
    slug: 'hop-business',
    owner: 'joseoquendo',
    version: '1.0.1',
    scheme: 'hopbusiness',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    newArchEnabled: false,

    icon: './assets/images/icon.png',

    splash: {
      image: './assets/images/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#7a5ce7',
    },

    ios: {
      bundleIdentifier: 'com.hopmobilityapp.hopbusiness',
      supportsTablet: true,
      runtimeVersion: '1.0.0',
      buildNumber: '6',
      config: {
        googleMaps: {
          googleMapsApiKey: 'TU_GOOGLE_MAPS_API_KEY',
        },
      },
      infoPlist: {
        NSCameraUsageDescription:
          'Hop Business necesita acceder a la cámara para permitirte tomar fotos de tu vehículo',
        NSMicrophoneUsageDescription:
          'Hop Business necesita acceder al micrófono para grabar el video de confirmación de identidad con Metamap',
        NSLocationWhenInUseUsageDescription:
          'Usamos tu ubicación mientras utilizas la app para mostrar viajes y vehículos cercanos.',
        UIBackgroundModes: ['fetch', 'remote-notification'],
        expoPushNotifications: true,
      },
      // googleServicesFile: './GoogleService-Info.plist',
    },

    android: {
      package: 'com.hopmobilityapp.hopbusiness',
      versionCode: 6,
      allowBackup: false,
      googleServicesFile: './google-services.json',
      runtimeVersion: '1.0.0',
      compileSdkVersion: 36,
      targetSdkVersion: 36,
      config: {
        googleMaps: {
          apiKey: 'TU_GOOGLE_MAPS_API_KEY',
        },
      },
      adaptiveIcon: {
        foregroundImage: './assets/images/icon.png',
        backgroundColor: '#ffffff',
      },
      splash: {
        image: './assets/images/logo.png',
        resizeMode: 'contain',
        backgroundColor: '#7a5ce7',
      },
      blockedPermissions: [
        'android.permission.READ_MEDIA_IMAGES',
        'android.permission.READ_MEDIA_VIDEO',
        'android.permission.READ_MEDIA_AUDIO',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ],
      permissions: [
        'ACCESS_NETWORK_STATE',
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.POST_NOTIFICATIONS',
        'com.google.android.c2dm.permission.RECEIVE',
      ],
    },

    plugins: [
      'expo-router',
      'expo-localization',
      'expo-font',
      'expo-document-picker',
      'react-native-expo-metamap-sdk',
      'sentry-expo',
      [
        'expo-notifications',
        {
          color: '#ffffff',
          mode: 'production',
          sounds: ['./assets/sounds/notification.wav'],
        },
      ],
    ],

    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: '0b6b3950-601a-43aa-a548-3cc298d97ec4',
      },
      APP_VARIANT: 'BUSINESS',
      EXPO_METAMAP_API_KEY: 'TU_METAMAP_API_KEY',
      EXPO_METAMAP_FLOW_ID: 'TU_METAMAP_FLOW_ID',
      EXPO_API_URL: 'https://apihop.hopmobilityapp.com/api',
      EXPO_PUBLIC_API_URL: 'https://apihop.hopmobilityapp.com/api',
      EXPO_PUBLIC_API_URL_MAP: process.env.EXPO_PUBLIC_API_URL_MAP,
      sentryDns: 'TU_SENTRY_DSN',
    },

    updates: {
      url: 'https://u.expo.dev/0b6b3950-601a-43aa-a548-3cc298d97ec4',
    },
  },
};