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
  where,
  setDoc,
  query,
  arrayUnion,
} from "firebase/firestore";
import imageCompression from "browser-image-compression"; // Import the image compression library

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
export const CONTRACTS_COLLECTION = "contracts";
export const STORAGE_BUCKET_URL =
  "https://storage.googleapis.com/free-ecu.appspot.com/";
export const AVATAR_THUMBS_FOLDER = "users/avatars/tumbs/";

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
  const user = await createUserWithEmailAndPassword(auth, email, password);
  await createNewUser();
  return user.user;
}

/**
 * Signs in a user with Google Authentication.
 * @returns The logged in user object.
 * @throws Will throw an error if authentication fails.
 */
export async function googleLogin() {
  const user = await signInWithPopup(auth, new GoogleAuthProvider());
  await createNewUser();
  return user.user;
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

  // Compress the image
  const options = {
    maxSizeMB: 1, // Max size in MB
    maxWidthOrHeight: 1920, // Max width or height
    useWebWorker: true, // Use web worker for faster compression
  };
  const compressedFile = await imageCompression(file, options);

  // Upload the compressed image
  await uploadBytes(fileRef, compressedFile);

  // Reference to the thumbnail image
  const thumbfileRef = ref(
    storage,
    `users/avatars/${auth.currentUser.uid}_thumb.webp`
  );

  // Generate thumbnail from the compressed image
  const thumbnailOptions = {
    maxSizeMB: 0.1, // Max size in MB for thumbnail
    maxWidthOrHeight: 250, // Max width or height for thumbnail
    useWebWorker: true, // Use web worker for faster compression
  };

  const compressedThumbnail = await imageCompression(
    compressedFile,
    thumbnailOptions
  );

  // Upload the thumbnail
  await uploadBytes(thumbfileRef, compressedThumbnail);

  // Get the download URL for the resized images
  const photoURL = await getDownloadURL(fileRef);
  const photoThumbURL = await getDownloadURL(thumbfileRef);

  // Update the auth profile with the resized image URL
  await updateProfile(auth.currentUser, { photoURL });

  // Update the database with the resized image URL
  await updatePhotoUrlDataBase(auth.currentUser.uid, photoURL, photoThumbURL);
}

//////////////
//Database
//////////////

export async function createNewUser() {
  console.log("Creating new user");
  const usersRef = collection(db, USERS_COLLECTION);
  const userDocRef = doc(usersRef, auth.currentUser.uid); // Create a document reference with UID as the ID

  const docSnapshot = await getDoc(userDocRef);

  if (docSnapshot.exists()) {
    console.log("User already exists in the database.");
    return;
  }

  let normalizedName = null;
  if (auth.currentUser.displayName) {
    normalizedName = auth.currentUser.displayName.toLowerCase();
  }

  // Use setDoc to create or overwrite the document with the UID
  await setDoc(userDocRef, {
    createdAt: serverTimestamp(),
    firstName: auth.currentUser.displayName || "",
    lastName: "",
    photoURL: auth.currentUser.photoURL || "",
    searchableFirstName: normalizedName || "",
    searchableLastName: "",
    signUpCompleted: false,
  });
  console.log("User created successfully.");
}
/**
 * Updates the photo URL of a user in the Firestore "users" collection.
 * @param uid User's Firebase UID.
 * @param newPhotoUrl New photo URL to update.
 * @returns A boolean value indicating whether the update was successful.
 */
export async function updatePhotoUrlDataBase(
  uid,
  newPhotoUrl,
  newPhotoThumbURL
) {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid); // Direct reference to the user document

    const docSnapshot = await getDoc(userDocRef);
    if (!docSnapshot.exists()) {
      throw new Error("No user found with the provided UID.");
    }

    await updateDoc(userDocRef, {
      photoURL: newPhotoUrl,
      photoThumbURL: newPhotoThumbURL,
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

export async function getChatRoomData(chatRoomId) {
  const chatRoomDocRef = doc(db, CHATROOM_COLLECTION, chatRoomId);
  const docSnapshot = await getDoc(chatRoomDocRef);

  if (docSnapshot.exists()) {
    const chatRoomData = docSnapshot.data();
    return chatRoomData as ChatRoomData;
  } else {
    console.log("No such document!");
    return false;
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
    // throw error; // Rethrow the error so the caller is aware that something went wrong.
    return false;
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
    return userData.isFreelancer || false;
  } catch (error) {
    console.error("Error fetching user information:", error);
    throw error; // Rethrow the error so the caller is aware that something went wrong.
  }
}

export async function sendMessageToChat(chatRoomId, newMessage, type = "text") {
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
      type: type,
    }
  );
}

export async function createNewChat(toUserUid) {
  const chatRoomsRef = collection(db, CHATROOM_COLLECTION);
  const usersRef = collection(db, USERS_COLLECTION);

  let chatRoomId;

  const chatRoomsQuery = query(
    chatRoomsRef,
    where("members", "array-contains", auth.currentUser.uid)
  );
  try {
    const querySnapshot = await getDocs(chatRoomsQuery);

    let existingRoom = null;

    querySnapshot.forEach((doc) => {
      if (doc.data().members.includes(toUserUid)) {
        existingRoom = doc.id;
      }
    });
    if (existingRoom) {
      return [existingRoom, false];
    } else {
      const members = [auth.currentUser.uid, toUserUid];
      const chatRoomRef = await addDoc(chatRoomsRef, {
        members: members,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
        status: "pending",
      });
      chatRoomId = chatRoomRef.id;
      const myUserDocRef = doc(usersRef, auth.currentUser.uid);
      const otherUserDocRef = doc(usersRef, toUserUid);

      await Promise.all([
        updateDoc(myUserDocRef, { chatRooms: arrayUnion(chatRoomId) }),
        updateDoc(otherUserDocRef, { chatRooms: arrayUnion(chatRoomId) }),
      ]);
      return [chatRoomId, true];
    }
  } catch (e) {
    console.log("Error", e);
  }
}

export const getContractData = async (contractId) => {
  const contractRef = doc(db, CONTRACTS_COLLECTION, contractId);
  const docSnapshot = await getDoc(contractRef);

  if (docSnapshot.exists()) {
    if (
      docSnapshot.data().freelancerUid === auth.currentUser.uid ||
      docSnapshot.data().clientUid === auth.currentUser.uid
    ) {
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

export async function updateChatRoomStatus(chatRoomId, newStatus) {
  try {
    const chatRoomDocRef = doc(db, CHATROOM_COLLECTION, chatRoomId); // Create a reference directly to the user's document

    // Check if the user’s document exists
    const docSnapshot = await getDoc(chatRoomDocRef);
    if (docSnapshot.exists()) {
      // Update the signUpCompleted field to true
      await updateDoc(chatRoomDocRef, {
        status: newStatus,
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
  photoThumbURL?: string;
  searchableFirstName: string;
  searchableLastName: string;
  signUpCompleted: boolean;
  uid: string;
  isFreelancer: boolean;
  chatRooms?: string[];
  phone?: string;
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
  type?: ["contract", "text", "file", "chat-started"];
}

/**
 * Structure representing chat room data.
 */
export interface ChatRoomData {
  id: string;
  members: string[];
  createdAt: {
    _Timestamp: Timestamp;
  };
  createdBy: string;
  status: "pending" | "active" | "blocked" | "declined";
  contractHistory: "noContract" | "activeContract" | "completedContract";
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

/**
 * Structure representing contract data.
 */
export interface ContractData {
  id: string;
  chatroomId: string;
  clientUid: string;
  freelancerUid: string;
  title: string;
  description: string;
  totalAmount: number;
  proposedBy: string;
  status:
    | "pending"
    | "active"
    | "completed"
    | "rejected"
    | "negotiating"
    | "accepted";
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