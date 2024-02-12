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
import {
  getDocs,
  getFirestore,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import diacritics from "diacritics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCwWei9JK-YeieDRKWtmbZvxtdLrujBeds",
  authDomain: "proyectointegrador-test3.firebaseapp.com",
  projectId: "proyectointegrador-test3",
  storageBucket: "proyectointegrador-test3.appspot.com",
  messagingSenderId: "950614839592",
  appId: "1:950614839592:web:02f3d729bd70361492001d",
  measurementId: "G-CCG2NESNTV",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const storage = getStorage();

export const db = getFirestore(app);
export const auth = getAuth(app);

//////////////
// Authentication
//////////////
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
    console.log("Signing up with email");
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

//////////////
// Storage
//////////////
// Add the file to Cloud Storage
export async function uploadProfilePicture(file) {
  const fileRef = ref(storage, auth.currentUser.uid + ".webp");

  const snapshot = await uploadBytes(fileRef, file);
  const photoURL = await getDownloadURL(fileRef);

  updateProfile(auth.currentUser, { photoURL });
  updatePhotoUrlDataBase(auth.currentUser.uid, photoURL);
}

//////////////
//Database
//////////////

async function addUserToDb() {
  try {
    const usersRef = collection(db, "users");
    let normalizedName = null;
    if (auth.currentUser.displayName) {
      normalizedName = diacritics
        .remove(auth.currentUser.displayName)
        .toLowerCase();
    }

    const querySnapshot = await getDocs(
      query(usersRef, where("uid", "==", auth.currentUser.uid))
    );
    const userExist = querySnapshot.docs.length > 0;

    if (!userExist) {
      await addDoc(usersRef, {
        uid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        firstName: auth.currentUser.displayName || "",
        lastName: "",
        photoURL: auth.currentUser.photoURL || "",
        searchableFirstName: normalizedName || "",
        searchableLastName: normalizedName || "",
        signUpCompleted: false,
      });
    }
  } catch (error) {
    console.error("Error adding user:", error);
  }
}

// Update the user's photoURL on the database "users"
export async function updatePhotoUrlDataBase(uid, newPhotoUrl) {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(
      query(usersRef, where("uid", "==", uid))
    );

    if (querySnapshot.docs.length === 0) {
      throw new Error("No user found with the provided UID.");
    }

    // Assuming `uid` is unique and can only correspond to one user, take the first document.
    const userDocRef = querySnapshot.docs[0].ref;

    // Update the photoURL field in the document
    await updateDoc(userDocRef, {
      photoURL: newPhotoUrl,
    });

    return true;
  } catch (error) {
    return false;
  }
}

//Get userName and photoUrl from UID
export async function getUserInfoFromUid(uid) {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(
      query(usersRef, where("uid", "==", uid))
    );
    const userData = querySnapshot.docs[0].data();
    const photoURL = userData.photoURL;
    const userName = userData.firstName + " " + userData.lastName;
    return [userName, photoURL];
  } catch (error) {
    console.error("Error fetching user photo:", error);
  }
}

//Check if user has completed the sign up process (firstName and lastName are set)
export async function signUpCompleted() {
  try {
    const usersRef = collection(db, "users");
    const querySnapshot = await getDocs(
      query(usersRef, where("uid", "==", auth.currentUser.uid))
    );
    const userData = querySnapshot.docs[0].data();
    if (userData.signUpCompleted) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
  }
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