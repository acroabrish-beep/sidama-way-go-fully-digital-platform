import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  projectId: "amazing-tokenizer-x6m9v",
  appId: "1:1059938619317:web:f5980f2e7a9a924f5553fc",
  apiKey: "AIzaSyCZxW3W_BNOwdgJlrNg9RWmHRMBAYDCY2s",
  authDomain: "amazing-tokenizer-x6m9v.firebaseapp.com",
  databaseURL: "https://amazing-tokenizer-x6m9v-default-rtdb.firebaseio.com",
  storageBucket: "amazing-tokenizer-x6m9v.firebasestorage.app",
  messagingSenderId: "1059938619317",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication & Firestore Services
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;
