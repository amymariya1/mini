// Firebase client setup for Google Auth
// Uses your existing hardcoded Firebase config
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2vYPdos4UoINTmSkihgwsK8SZNPnFy68",
  authDomain: "mindmirror-8a907.firebaseapp.com",
  projectId: "mindmirror-8a907",
  storageBucket: "mindmirror-8a907.firebasestorage.app",
  messagingSenderId: "493708832535",
  appId: "1:493708832535:web:eca3d1b69df356150a9152",
  measurementId: "G-MMP5B66BYZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and Google Provider, and export them for use in the app
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Prompt account selector each time
googleProvider.setCustomParameters({ prompt: "select_account" });

// Optional: initialize analytics (safe in CRA browser environment)
try {
  getAnalytics(app);
} catch (_) {
  // ignore analytics init errors (e.g., unsupported env)
}