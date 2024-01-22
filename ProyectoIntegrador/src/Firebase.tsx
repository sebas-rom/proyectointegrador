// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnBLHWuteZaUn17Cmmuq5Z5OuQMzLpiRI",
  authDomain: "proyectointegrador-593fd.firebaseapp.com",
  projectId: "proyectointegrador-593fd",
  storageBucket: "proyectointegrador-593fd.appspot.com",
  messagingSenderId: "943524053437",
  appId: "1:943524053437:web:c052671aa95e6dbd6d52d4",
  measurementId: "G-4JZ36Q9M62",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
