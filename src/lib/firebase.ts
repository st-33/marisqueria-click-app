"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

// Configuration is hardcoded for reliability in App Hosting.
// This config is safe to be exposed on the client side.
const firebaseConfig = {
  apiKey: "AIzaSyAw0HkT4yszkRObWbq_on5JcytSNzXXMmY",
  authDomain: "marisqueriaclick.firebaseapp.com",
  databaseURL: "https://marisqueriaclick-default-rtdb.firebaseio.com",
  projectId: "marisqueriaclick",
  storageBucket: "marisqueriaclick.appspot.com",
  messagingSenderId: "540030243704",
  appId: "1:540030243704:web:0eab1fd241ea34205b2e8d"
};

let app: FirebaseApp;
let database: Database | null = null;

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    database = getDatabase(app);
} catch (error) {
    console.error("Firebase initialization failed:", error);
}

export { database };
