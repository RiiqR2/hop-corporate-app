//import withMetaMapAllowBackupFix from './allow-backup';

export default {
  expo: {
    name: 'hop',
    slug: 'hop',
    version: '1.0.8',
    orientation: 'portrait',
    scheme: 'hop',
    userInterfaceStyle: 'automatic',
    newArchEnabled: false,
    icon: './assets/images/icon.png',
    splash: {
      image: './assets/images/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#7a5ce7',
    },
    ios: {
      bundleIdentifier: 'com.hopmobilityapp.hop',
      supportsTablet: true,
      //googleServicesFile: './GoogleService-Info.plist', //COMENTADO PORQUE IOS USA EXPO
      runtimeVersion: '1.0.2',
      config: {
        googleMaps: {
          googleMapsApiKey: 'AIzaSyArUM8hy9HqzHStf1JXjiNUho1pD_o69Fk',
        },
      },
      infoPlist: {
        NSCameraUsageDescription: "Hop necesita acceder a la cámara para permitirte tomar fotos de tu vehículo",
        NSMicrophoneUsageDescription: "Hop necesita acceder al micrófono para grabar el video de confirmación de identidad con Metamap",
        NSLocationWhenInUseUsageDescription: "Hop necesita acceder a la ubicación para detectar viajes y vehículos ceranos",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Hop necesita acceder a la ubicación para detectar viajes y vehículos ceranos",
        NSLocationAlwaysUsageDescription: "Hop necesita acceder a la ubicación para detectar viajes y vehículos ceranos",
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
        },
        UIBackgroundModes: [
          'fetch', 
          'remote-notification',
          'location'
        ],
        expoPushNotifications: true,
      },
    },
    android: {
      package: 'com.hopmobilityapp.hop',
      allowBackup: false,
      googleServicesFile: './google-services.json',
      runtimeVersion: '1.0.2',
      compileSdkVersion: 36,
      targetSdkVersion: 36,
      config: {
        googleMaps: {
          apiKey: 'AIzaSyArUM8hy9HqzHStf1JXjiNUho1pD_o69Fk',
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
        'android.permission.ACCESS_BACKGROUND_LOCATION',
        'android.permission.FOREGROUND_SERVICE',
        'android.permission.FOREGROUND_SERVICE_LOCATION',
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
      //withMetaMapAllowBackupFix,
    ],
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: '08b0a891-431e-4f40-9b5f-dc956334ab1a',
      },
      EXPO_METAMAP_API_KEY: '686346b0716d906abf919d53',
      EXPO_METAMAP_FLOW_ID: '686346b0716d90b218919d52',
      EXPO_API_URL: 'https://apihop.hopmobilityapp.com/api',
      EXPO_PUBLIC_API_URL: 'https://apihop.hopmobilityapp.com/api',
      EXPO_PUBLIC_API_URL_MAP: '',
      sentryDns: 'https://6f5ac5a95d9be4178572453ed05e38ee@o4509590339584000.ingest.us.sentry.io/4509590415671296',
    },
    owner: 'joseoquendo',
    updates: {
      url: 'https://u.expo.dev/08b0a891-431e-4f40-9b5f-dc956334ab1a',
    },
  },
};
