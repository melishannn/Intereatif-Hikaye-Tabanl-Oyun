import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

const isConfigured = Object.keys(firebaseConfig).length > 0;

export const app = isConfigured ? initializeApp(firebaseConfig) : (null as any);
export const db = isConfigured
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : (null as any);
export const auth = isConfigured ? getAuth(app) : (null as any);
