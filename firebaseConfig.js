import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBmqpRwPnlO2OcfArS0ZricbvkuYoFsgUQ",
  authDomain: "hop-mobility.firebaseapp.com",
  projectId: "hop-mobility",
  storageBucket: "hop-mobility.appspot.com",
  messagingSenderId: "339133494374",
  appId: "1:339133494374:ios:6e167fe95a0d45b7e029a7",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, firebaseConfig };



//ANDROID
// import { initializeApp } from "firebase/app";
// import { getMessaging } from 'firebase/messaging';

// const firebaseConfig = {
//   apiKey: "AIzaSyBmqpRwPnlO2OcfArS0ZricbvkuYoFsgUQ",
//   authDomain: "hop-mobility.firebaseapp.com",
//   projectId: "hop-mobility",
//   storageBucket: "hop-mobility.appspot.com",
//   messagingSenderId: "190024067708",
//   appId: "1:339133494374:android:576964032e07fdc1e029a7",
// };

// const app = initializeApp(firebaseConfig);

// const messaging = getMessaging(app);

// export { messaging };
