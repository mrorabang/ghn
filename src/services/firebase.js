// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA0mlM6pGfKauaJrdZrtAtjZlyO5xHiBvs",
  authDomain: "ghnschedule.firebaseapp.com",
  projectId: "ghnschedule",
  storageBucket: "ghnschedule.firebasestorage.app",
  messagingSenderId: "496767951808",
  appId: "1:496767951808:web:722ba0763f3b9dc97f1e25",
  measurementId: "G-NVFN0S25R6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);