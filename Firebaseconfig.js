// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7vZPjVjAUaJVy-mPQ7LmU_k0SOtrculY",
  authDomain: "appnh-95306.firebaseapp.com",
  projectId: "appnh-95306",
  storageBucket: "appnh-95306.firebasestorage.app",
  messagingSenderId: "1071762058465",
  appId: "1:1071762058465:web:4abb668a352d61f02fdba0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const authentication = getAuth(app)
const database = getFirestore();

export { authentication, database };