import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAnlhBBZbza0-LuKjE_ma3XskDDxfC3GWY",
  authDomain: "devacademia-89d43.firebaseapp.com",
  projectId: "devacademia-89d43",
  storageBucket: "devacademia-89d43.firebasestorage.app",
  messagingSenderId: "34290111779",
  appId: "1:34290111779:web:37714cb9f413a823f3e896"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
