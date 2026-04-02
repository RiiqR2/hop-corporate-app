# 📱 HOP - Aplicación Móvil

Aplicación desarrollada con **Expo Router** y tecnologías modernas para facilitar el desarrollo móvil con una arquitectura modular, navegación eficiente y una interfaz basada en componentes reutilizables.

---

## 🚀 Tecnologías principales

- **Expo SDK** `~52.0.46`
- **React Native** `^0.76.9`
- **Expo Router** `~4.0.16`
- **Gluestack UI** – Componentes estilizados para interfaces móviles
- **Tailwind CSS** (a través de NativeWind)
- **Formik + Yup** – Manejo y validación de formularios
- **i18next** – Traducción y localización
- **Firebase** – Servicio de Notificaciones
- **Axios + SWR** – Llamadas a APIs y cacheo de datos
- **Socket.IO** – Comunicación en tiempo real
- **Yup** para validaciones
---

## 📁 Estructura del proyecto


```bash
src/
│
├── app/              # Rutas organizadas por funcionalidad usando Expo Router
│   ├── (auth)/       # Autenticación (login, registro, etc.)
│   ├── (booking)/    # Reservas
│   ├── (history)/    # Historial de actividades
│   ├── (home)/       # Pantalla principal
│   ├── (profile)/    # Perfil de usuario
│   ├── (settings)/   # Configuración
│   ├── (tabs)/       # Navegación por pestañas
│   ├── notification/ # Notificaciones
│   ├── _layout.tsx   # Layout principal
│   ├── +not-found.tsx # Página para rutas no encontradas
│   ├── error.tsx     # Página de error global
│   └── loading.tsx   # Pantalla de carga
│
├── axios/            # Configuración de Axios y endpoints base
├── components/       # Componentes UI reutilizables
├── context/          # Contextos globales (React Context API)
├── helpers/          # Funciones auxiliares
├── hooks/            # Hooks personalizados
├── services/         # Lógica de negocio (servicios)
├── utils/            # Constantes, validaciones, enums, etc.
---
```

---


## 📦 Dependencias destacadas

### UI & Navegación

- `@gluestack-ui/themed`
- `@gluestack-style/react`
- `@react-navigation/native`
- `expo-router`
- `nativewind`
- `react-native-safe-area-context`
- `react-native-vector-icons`
- `expo-status-bar`

### Formularios & Validación

- `formik`
- `yup`
- `@hookform/resolvers`
- `react-hook-form`

### Internacionalización

- `i18next`
- `react-i18next`

### HTTP y Realtime

- `axios`
- `swr`
- `socket.io-client`

### Firebase

- `notificaciones`

---

## 🧪 Scripts disponibles

```bash
npm start       # Inicia el servidor de desarrollo
npm run android # Abre la app en Android (emulador o físico)
npm run ios     # Abre la app en iOS (solo en macOS)
npm run lint    # Ejecuta ESLint
