// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { useEffect, useState } from "react";

// import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

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
// const analytics = getAnalytics(app);
const storage = getStorage();
export const auth = getAuth(app);

export async function emailLogin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw error; // Rethrow the error for higher-level handling
  }
}

export async function emailSignUp(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw error; // Rethrow the error for higher-level handling
  }
}

export async function googleLogin() {
  try {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    // const credential = GoogleAuthProvider.credentialFromResult(result);
    // const token = credential?.accessToken;
    const user = result.user;

    return user;
  } catch (error) {
    throw error; // Rethrow the error for higher-level handling
  }
}

export async function googleSignUp() {
  try {
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    // const credential = GoogleAuthProvider.credentialFromResult(result);
    // const token = credential?.accessToken;
    const user = result.user;

    return user;
  } catch (error) {
    throw error; // Rethrow the error for higher-level handling
  }
}

export function logout() {
  return signOut(auth)
    .then(() => {
      // Sign-out successful.
    })
    .catch((error) => {
      // An error happened.
      console.log(error);
    });
}

// Custom Hook
export function useAuth() {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      //@ts-ignore
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user: currentUser, loading: loading };
}

// Storage
export async function upload(file, currentUser) {
  const fileRef = ref(storage, currentUser.uid + ".webp");

  const snapshot = await uploadBytes(fileRef, file);
  const photoURL = await getDownloadURL(fileRef);

  updateProfile(currentUser, { photoURL });
}
