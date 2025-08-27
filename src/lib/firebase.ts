
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC342HaTcWtQ_Ed8F6bJ6qtVk8zsiZ7aJU",
  authDomain: "synapse-portfolio-xy86p.firebaseapp.com",
  projectId: "synapse-portfolio-xy86p",
  storageBucket: "synapse-portfolio-xy86p.firebasestorage.app",
  messagingSenderId: "287180121711",
  appId: "1:287180121711:web:d49f7609222e65901e0f9a",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
