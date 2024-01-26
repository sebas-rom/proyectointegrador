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
  deleteUser,
} from "firebase/auth";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getDocs, getFirestore, query, where } from "firebase/firestore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import diacritics from "diacritics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQHN12-ZP3NETZqToYT4ahT9qfKR6Vlik",
  authDomain: "proyectointegradortest1.firebaseapp.com",
  projectId: "proyectointegradortest1",
  storageBucket: "proyectointegradortest1.appspot.com",
  messagingSenderId: "1017865779241",
  appId: "1:1017865779241:web:8291ca98d7d2ae5bc50438",
  measurementId: "G-932308X72X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const storage = getStorage();

export const db = getFirestore(app);
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
  } finally {
    await addUserToDb();
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
  } finally {
    await addUserToDb();
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

function processText(inputText) {
  // Convert to lowercase and remove diacritics
  const diacRemove = diacritics.remove(inputText);
  let lowercaseText = diacRemove.toLowerCase();
  return lowercaseText;
}

async function addUserToDb() {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(
      query(usersRef, where("uid", "==", auth.currentUser.uid))
    );
    const userExist = querySnapshot.docs.length > 0;
    const normalizedName = diacritics
      .remove(auth.currentUser.displayName)
      .toLowerCase();

    if (!userExist) {
      await addDoc(usersRef, {
        uid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        firstName: auth.currentUser.displayName || "",
        lastName: "",
        photoURL: auth.currentUser.photoURL || "",
        searchableFirstName: normalizedName || "",
        searchableLastName: normalizedName || "",
      });
    }
  } catch (error) {
    console.error("Error adding user:", error);
  }
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
export async function uploadProfilePicture(file) {
  const fileRef = ref(storage, auth.currentUser.uid + ".webp");

  const snapshot = await uploadBytes(fileRef, file);
  const photoURL = await getDownloadURL(fileRef);

  updateProfile(auth.currentUser, { photoURL });
}

export async function updateDisplayName(updated) {
  await updateProfile(auth.currentUser, { displayName: updated });
}

export async function deleteAccount() {
  await deleteUser(auth.currentUser)
    .then(() => {
      // User deleted.
    })
    .catch((error) => {
      throw error;
    });
}