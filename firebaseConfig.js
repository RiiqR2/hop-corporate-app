import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAOPbDW6YhH5bTQ4SPr3JE44YbOmwPkBgQ",
  authDomain: "hop-business.firebaseapp.com",
  projectId: "hop-business",
  storageBucket: "hop-business.appspot.com",
  messagingSenderId: "464721955881",
  appId: "1:464721955881:ios:79f78be9029da620682038",
};

const app = initializeApp(firebaseConfig);

export { app, firebaseConfig };