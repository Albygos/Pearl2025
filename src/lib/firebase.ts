// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzyND_2SL5D4xAvOt2XyJVyY-tBJiRucM",
    authDomain: "kcym-malsaram.firebaseapp.com",
    databaseURL: "https://kcym-malsaram-default-rtdb.firebaseio.com",
    projectId: "kcym-malsaram",
    storageBucket: "kcym-malsaram.firebasestorage.app",
    messagingSenderId: "874679083400",
    appId: "1:874679083400:web:7b066cfe16d0906ea91a3d",
    measurementId: "G-5ZJZE0REZ5"
  };
// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, database, auth, storage };
