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
  setDoc,
  getDoc,
} from "firebase/firestore";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import diacritics from "diacritics";
import { getMessaging, getToken } from "firebase/messaging";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnBLHWuteZaUn17Cmmuq5Z5OuQMzLpiRI",
  authDomain: "proyectointegrador-593fd.firebaseapp.com",
  databaseURL: "https://proyectointegrador-593fd-default-rtdb.firebaseio.com",
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

export const db = getFirestore(app);
export const auth = getAuth(app);

//////////////
// Authentication
//////////////
/**
 * Attempts to log in a user with the provided email and password.
 * @param email The user's email address.
 * @param password The user's password.
 * @returns The logged in user object.
 * @throws Will throw an error if authentication fails.
 */
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

/**
 * Registers a new user with the provided email and password.
 * @param email The new user's email address.
 * @param password The new user's password.
 * @returns The newly created user object.
 * @throws Will throw an error if registration fails.
 */
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
    // await addUserToDb();
  }
}

/**
 * Signs in a user with Google Authentication.
 * @returns The logged in user object.
 * @throws Will throw an error if authentication fails.
 */
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
    // await addUserToDb();
  }
}

/**
 * Logs out the current user.
 * @throws Will throw an error if logout fails.
 */
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

/**
 * Custom React hook that provides authentication state management.
 * @returns An object containing `user` and `loading` state.
 */
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
/**
 * Uploads a user profile picture to Firebase Storage and updates the user's profile.
 * @param file The image file to upload.
 */
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

/**
 * Adds a new user to the "users" collection in Firestore.
 * @private This function is intended to be used internally by the module.
 * @throws Will throw an error if adding the user fails.
 * @deprecated This function is deprecated and should not be used, now runned by cloud functions.
 */
async function addUserToDb() {
  // try {
  //   const uid = auth.currentUser.uid; // Replace this with the actual UID from your authentication state
  //   const usersRef = collection(db, "users");
  //   const userDocRef = doc(usersRef, uid); // Create a document reference with UID as the ID
  //   let normalizedName = null;
  //   if (auth.currentUser.displayName) {
  //     normalizedName = diacritics
  //       .remove(auth.currentUser.displayName)
  //       .toLowerCase();
  //   }
  //   const querySnapshot = await getDocs(
  //     query(usersRef, where("uid", "==", uid))
  //   );
  //   const userExist = !querySnapshot.empty;
  //   if (!userExist) {
  //     // Use setDoc to create or overwrite the document with the UID
  //     await setDoc(userDocRef, {
  //       uid: uid,
  //       createdAt: serverTimestamp(),
  //       firstName: auth.currentUser.displayName || "",
  //       lastName: "",
  //       photoURL: auth.currentUser.photoURL || "",
  //       searchableFirstName: normalizedName || "",
  //       searchableLastName: normalizedName || "",
  //       signUpCompleted: false,
  //     });
  //   }
  // } catch (error) {
  //   console.error("Error adding user to DB:", error);
  // }
}

/**
 * Updates the photo URL of a user in the Firestore "users" collection.
 * @param uid User's Firebase UID.
 * @param newPhotoUrl New photo URL to update.
 * @returns A boolean value indicating whether the update was successful.
 */
export async function updatePhotoUrlDataBase(uid, newPhotoUrl) {
  try {
    const userDocRef = doc(db, "users", uid); // Direct reference to the user document

    // Check if the user document exists before updating
    const docSnapshot = await getDoc(userDocRef);
    if (!docSnapshot.exists()) {
      throw new Error("No user found with the provided UID.");
    }

    // Update the photoURL field in the document
    await updateDoc(userDocRef, {
      photoURL: newPhotoUrl,
    });

    return true;
  } catch (error) {
    console.error("Error updating user photo URL:", error);
    return false;
  }
}

/**
 * Retrieves user information from Firestore based on the given UID.
 * @param uid The Firebase UID of the user.
 * @returns A tuple containing the user's name and photo URL.
 * @throws Will throw an error if the user information cannot be fetched.
 */
export async function getUserInfoFromUid(uid) {
  try {
    const userDocRef = doc(db, "users", uid); // Reference to the user document with UID as the ID
    const docSnapshot = await getDoc(userDocRef);

    if (docSnapshot.exists()) {
      const userData = docSnapshot.data();
      const photoURL = userData.photoURL;
      const userName = `${userData.firstName} ${userData.lastName}`.trim();
      return [userName, photoURL];
    } else {
      throw new Error("User document does not exist.");
    }
  } catch (error) {
    console.error("Error fetching user information:", error);
    throw error; // Rethrow the error so the caller is aware that something went wrong.
  }
}

/**
 * Checks whether the user has completed the signup process by setting their first and last names.
 * @returns A boolean value indicating whether the signup process is complete.
 * @throws Will throw an error if checking the user's signup status fails.
 */
export async function signUpCompleted() {
  try {
    const uid = auth.currentUser.uid; // Make sure you have the current user's UID
    const userDocRef = doc(db, "users", uid); // Create a reference directly to the user's document

    const docSnapshot = await getDoc(userDocRef);

    if (docSnapshot.exists()) {
      const userData = docSnapshot.data();
      return userData.signUpCompleted || false; // Return the signUpCompleted status or false if not set
    } else {
      console.error("No such document!");
      return false; // Assume sign up is not completed if there's no document
    }
  } catch (error) {
    console.error("Error checking sign-up status:", error);
    throw error; // Rethrow the error for handling upstream
  }
}

/**
 * Deletes the currently logged-in user's account.
 * @throws Will throw an error if the account deletion fails.
 */
// export async function deleteAccount() {
//   await deleteUser(auth.currentUser)
//     .then(() => {
//       // User deleted.
//     })
//     .catch((error) => {
//       throw error;
//     });
// }

// //Messaging
// // Initialize Firebase Cloud Messaging and get a reference to the service
// const messaging = getMessaging(app);
// getToken(messaging, {
//   vapidKey:
//     "BFrh-yUKGPTpmKWMkfAUT7qzg-I8jlej2dKHkbdGB9DiUODzWnOn66YINLMdLfYDYhnXsioZU6uWkVJ4q8B9U6M",
// });