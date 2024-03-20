// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { useEffect, useState } from "react";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  // deleteUser,
} from "firebase/auth";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import {
  getFirestore,
  updateDoc,
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
// import { collection, addDoc, serverTimestamp } from "firebase/firestore";
// import diacritics from "diacritics";
// import { getMessaging, getToken } from "firebase/messaging";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAE3WzT6Npp9ZmbXV-0_qX7lf-VMEVlKu4",
  authDomain: "free-ecu.firebaseapp.com",
  projectId: "free-ecu",
  storageBucket: "free-ecu.appspot.com",
  messagingSenderId: "1058993911743",
  appId: "1:1058993911743:web:b582d51298bccbd974530a",
  measurementId: "G-TCJF7MC3N1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage();

export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const CHATROOM_COLLECTION = "chatrooms";
export const MESSAGES_COLLECTION = "messages";
export const USERS_COLLECTION = "users";
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
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => userCredential.user)
    .catch((error) => {
      throw error; // Rethrow the error for higher-level handling
    });
}

/**
 * Registers a new user with the provided email and password.
 * @param email The new user's email address.
 * @param password The new user's password.
 * @returns The newly created user object.
 * @throws Will throw an error if registration fails.
 */
export async function emailSignUp(email, password) {
  console.log("Signing up with email");
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => userCredential.user)
    .catch((error) => {
      throw error; // Rethrow the error for higher-level handling
    });
}

/**
 * Signs in a user with Google Authentication.
 * @returns The logged in user object.
 * @throws Will throw an error if authentication fails.
 */
export async function googleLogin() {
  const result = await signInWithPopup(auth, new GoogleAuthProvider()).catch(
    (error) => {
      throw error; // Rethrow the error for higher-level handling
    }
  );

  return result.user;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Explicitly type currentUser
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      // Explicitly type user
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
export async function updateProfilePicture(file) {
  const fileRef = ref(storage, `users/avatars/${auth.currentUser.uid}.webp`);
  await uploadBytes(fileRef, file);

  // Reference to the resized image
  const resizedRef = ref(
    storage,
    `users/avatars/${auth.currentUser.uid}_200x200.webp`
  );

  // Get the download URL for the resized image
  const photoURL = await getDownloadURL(resizedRef);

  // Update the auth profile with the resized image URL
  await updateProfile(auth.currentUser, { photoURL });

  // Update the database with the resized image URL
  await updatePhotoUrlDataBase(auth.currentUser.uid, photoURL);
}

//////////////
//Database
//////////////

/**
 * Updates the photo URL of a user in the Firestore "users" collection.
 * @param uid User's Firebase UID.
 * @param newPhotoUrl New photo URL to update.
 * @returns A boolean value indicating whether the update was successful.
 */
export async function updatePhotoUrlDataBase(uid, newPhotoUrl) {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid); // Direct reference to the user document

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
 * Retrieves user data from the Firestore database based on the user's UID.
 * If the document for the specified UID does not exist, the function will throw an error.
 *
 * @param {string} uid - The unique identifier of the user to fetch data for.
 * @returns {Promise<UserData>} A promise that resolves with the UserData object if the document exists,
 * or rejects with an error if it does not exist or there is a problem with the database operation.
 */
export async function getUserData(uid: string): Promise<UserData> {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid); // Reference to the user document with UID as the ID
    const docSnapshot = await getDoc(userDocRef);

    if (docSnapshot.exists()) {
      const userData = docSnapshot.data() as UserData; // Type assertion
      return userData;
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
export async function isSignUpCompleted() {
  try {
    const userData = await getUserData(auth.currentUser.uid);
    return userData.signUpCompleted || false;
  } catch (error) {
    console.error("Error checking sign-up status:", error);
    throw error; // Rethrow the error so the caller is aware that something went wrong.
  }
}

/**
 * Sets the `signUpCompleted` field to `true` for the current user.
 * This function assumes that there is a current user logged in.
 *
 * @returns {Promise<boolean>} A promise that resolves with `true` if the update is successful,
 * or `false` if the user document does not exist. It will reject with an error on failure.
 */
export async function SignUpCompletedSetTrue() {
  try {
    const uid = auth.currentUser.uid; // Assuming you have the current user's UID
    const userDocRef = doc(db, USERS_COLLECTION, uid); // Create a reference directly to the user's document

    // Check if the user’s document exists
    const docSnapshot = await getDoc(userDocRef);
    if (docSnapshot.exists()) {
      // Update the signUpCompleted field to true
      await updateDoc(userDocRef, {
        signUpCompleted: true,
      });
      return true; // Return true to indicate the sign-up completion status is set
    } else {
      console.error("No such document!");
      return false; // Document doesn’t exist
    }
  } catch (error) {
    console.error("Error setting sign-up completion:", error);
    throw error; // Rethrow any errors for handling upstream
  }
}

/**
 * Checks whether the user is a freelancer.
 * @param {string} uid - The unique identifier of the user to check.
 * @returns {Promise<boolean>} A promise that resolves with a boolean value indicating whether the user is a freelancer,
 * or rejects with an error if there is a problem with the database operation.
 */
export async function isFreelancer(uid: string) {
  try {
    const userData = await getUserData(uid);
    return userData.freelancer || false;
  } catch (error) {
    console.error("Error fetching user information:", error);
    throw error; // Rethrow the error so the caller is aware that something went wrong.
  }
}

export async function sendMessageToChat(chatRoomId, newMessage) {
  const chatRoomDocRef = doc(db, CHATROOM_COLLECTION, chatRoomId);
  const chatRoomSnapshot = await getDoc(chatRoomDocRef);
  let members = [];
  if (chatRoomSnapshot.exists()) {
    members = chatRoomSnapshot.data().members;
  }

  const readStatus = {};
  members.forEach((member) => {
    if (member !== auth.currentUser.uid) {
      readStatus[member] = false;
    } else {
      readStatus[member] = true;
    }
  });

  await addDoc(
    collection(db, CHATROOM_COLLECTION, chatRoomId, MESSAGES_COLLECTION),
    {
      charRoomId: chatRoomId,
      text: newMessage,
      createdAt: serverTimestamp(),
      uid: auth.currentUser.uid,
      read: readStatus,
    }
  );
}

export async function sendContractAsMessage(chatRoomId, contractId) {
  //send it as a message:
  const chatRoomDocRef = doc(db, "chatrooms", chatRoomId);
  const chatRoomSnapshot = await getDoc(chatRoomDocRef);
  let members = [];
  if (chatRoomSnapshot.exists()) {
    members = chatRoomSnapshot.data().members;
  }

  await addDoc(
    collection(db, CHATROOM_COLLECTION, chatRoomId, MESSAGES_COLLECTION),
    {
      chatRoomId,
      type: "contract",
      text: contractId,
      createdAt: serverTimestamp(),
      uid: auth.currentUser.uid,
    }
  );
}

export const getContractData = async (contractId) => {
  const contractRef = doc(db, "contracts", contractId);
  const docSnapshot = await getDoc(contractRef);

  if (docSnapshot.exists()) {
    if (
      docSnapshot.data().freelancerUid === auth.currentUser.uid ||
      docSnapshot.data().clientUid === auth.currentUser.uid
    ) {
      const toUserUid =
        docSnapshot.data().freelancerUid === auth.currentUser.uid
          ? docSnapshot.data().clientUid
          : docSnapshot.data().freelancerUid;
      const toUserData = await getUserData(toUserUid);
      const name = toUserData.firstName + " " + toUserData.lastName;
      if (docSnapshot.data().previouslySaved) {
        const milestonesRef = collection(
          db,
          `contracts/${contractId}/milestones`
        );
        const milestonesSnapshot = await getDocs(milestonesRef);
        const milestonesData = milestonesSnapshot.docs.map((doc) => ({
          ...(doc.data() as MilestoneData),
          id: doc.id,
        }));
        const tempMilestones = [];
        milestonesData.forEach((milestone) => {
          tempMilestones.push({
            title: milestone.title,
            amount: milestone.amount,
            dueDate: milestone.dueDate,
            id: milestone.id,
          });
        });
        return [docSnapshot.data(), milestonesData];
      } else {
        return [docSnapshot.data(), null];
      }
    } else {
      console.log("This is not your contract");
      return false;
    }
  } else {
    console.log("No such document!");
    return false;
  }
};
//Interfaces

/**
 * Represents a timestamp with seconds and nanoseconds.
 */
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

/**
 * Structure representing user data.
 */
export interface UserData {
  createdAt: {
    _Timestamp: Timestamp;
  };
  firstName: string;
  lastName: string;
  photoURL: string;
  searchableFirstName: string;
  searchableLastName: string;
  signUpCompleted: boolean;
  uid: string;
  freelancer: boolean;
}

/**
 * Structure representing message data.
 */
export interface MessageData {
  id?: string;
  createdAt: {
    _Timestamp: Timestamp;
  };
  text?: string;
  uid?: string;
  read?: { [uid: string]: boolean };
  userName?: string;
  photoURL?: string | null;
  type?: ["contract", "text", "file"];
}

/**
 * Structure representing milestone data.
 */
export interface MilestoneData {
  id: string;
  title: string;
  description: string;
  amount: number;
  status?: "pending" | "completed" | "rejected";
  dueDate: string;
}

export interface ContractData {
  id: string;
  chatroomId: string;
  clientUid: string;
  freelancerUid: string;
  title: string;
  description: string;
  totalAmount: number;
  proposedBy: string;
  status: "pending" | "active" | "completed" | "rejected";
  previouslySaved: boolean;
  milestones: MilestoneData[];
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
//     "",
// });

// /**
//  * Adds a new user to the "users" collection in Firestore.
//  * @private This function is intended to be used internally by the module.
//  * @throws Will throw an error if adding the user fails.
//  * @deprecated This function is deprecated and should not be used, now runned by cloud functions.
//  */
// function addUserToDb() {
//   try {
//     const uid = auth.currentUser.uid; // Replace this with the actual UID from your authentication state
//     const usersRef = collection(db, "users");
//     const userDocRef = doc(usersRef, uid); // Create a document reference with UID as the ID
//     let normalizedName = null;
//     if (auth.currentUser.displayName) {
//       normalizedName = diacritics
//         .remove(auth.currentUser.displayName)
//         .toLowerCase();
//     }
//     const querySnapshot = await getDocs(
//       query(usersRef, where("uid", "==", uid))
//     );
//     const userExist = !querySnapshot.empty;
//     if (!userExist) {
//       // Use setDoc to create or overwrite the document with the UID
//       await setDoc(userDocRef, {
//         uid: uid,
//         createdAt: serverTimestamp(),
//         firstName: auth.currentUser.displayName || "",
//         lastName: "",
//         photoURL: auth.currentUser.photoURL || "",
//         searchableFirstName: normalizedName || "",
//         searchableLastName: normalizedName || "",
//         signUpCompleted: false,
//       });
//     }
//   } catch (error) {
//     console.error("Error adding user to DB:", error);
//   }
// }