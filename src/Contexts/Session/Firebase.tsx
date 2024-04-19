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
  sendEmailVerification,
  sendPasswordResetEmail,
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
import imageCompression from "browser-image-compression";

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
export const storage = getStorage();
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const CHATROOM_COLLECTION = "chatrooms";
export const MILESTONES_COLLECTION = "milestones";
export const FEEDBACK_COLLECTION = "feedback";
export const MESSAGES_COLLECTION = "messages";
export const USERS_COLLECTION = "users";
export const CONTRACTS_COLLECTION = "contracts";
export const STORAGE_BUCKET_URL = "https://storage.googleapis.com/free-ecu.appspot.com/";
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
  if (user.user.emailVerified === false) {
    sendEmailVerification(user.user);
    await createNewUser();
  }
  return user.user;
}

/**
 * Signs in a user with Google Authentication.
 * @returns The logged in user object.
 * @throws Will throw an error if authentication fails.
 */
export async function googleLogin() {
  const user = await signInWithPopup(auth, new GoogleAuthProvider());
  if (user.user.emailVerified === false) {
    sendEmailVerification(user.user);
    await createNewUser();
  }
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

export function recoverPassword(email) {
  sendPasswordResetEmail(auth, email);
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
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user: currentUser,
    loading: loading,
  };
}

//////////////
// Storage
//////////////
/**
 * Uploads a compressed user profile picture to Firebase Storage and updates the user's profile.
 * @param file The image file to upload.
 */
export async function updateProfilePicture(file) {
  const fileRef = ref(storage, `users/avatars/${auth.currentUser.uid}.webp`);

  // Compress the image
  const options = {
    maxSizeMB: 2, // Max size in MB
    maxWidthOrHeight: 1920, // Max width or height
    useWebWorker: true, // Use web worker for faster compression
  };
  const compressedFile = await imageCompression(file, options);

  // Upload the compressed image
  await uploadBytes(fileRef, compressedFile);

  // Reference to the thumbnail image
  const thumbfileRef = ref(storage, `users/avatars/${auth.currentUser.uid}_thumb.webp`);

  // Generate thumbnail from the compressed image
  const thumbnailOptions = {
    maxSizeMB: 0, // Max size in MB for thumbnail
    maxWidthOrHeight: 250, // Max width or height for thumbnail
    useWebWorker: true, // Use web worker for faster compression
  };

  const compressedThumbnail = await imageCompression(compressedFile, thumbnailOptions);

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

/**
 * Creates a new user document in the Firestore "users" collection.
 */
export async function createNewUser() {
  const usersRef = collection(db, USERS_COLLECTION);
  const userDocRef = doc(usersRef, auth.currentUser.uid); // Create a document reference with UID as the ID

  const docSnapshot = await getDoc(userDocRef);

  if (docSnapshot.exists()) {
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
    uid: auth.currentUser.uid,
  });
}

/**
 * Updates the photo URL of a user in the Firestore "users" collection.
 * @param uid User's Firebase UID.
 * @param newPhotoUrl New photo URL to update.
 * @returns A boolean value indicating whether the update was successful.
 */
export async function updatePhotoUrlDataBase(uid, newPhotoUrl, newPhotoThumbURL) {
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

/**
 * Retrieves the chat room data from the Firestore database based on the chat room ID.
 * If the document for the specified chat room ID does not exist, the function will return `false`.
 * @param {string} chatRoomId - The unique identifier of the chat room to fetch data for.
 * @returns {Promise<ChatRoomData | false>} A promise that resolves with the ChatRoomData object if the document exists,
 * or `false` if it does not exist or there is a problem with the database operation.
 **/
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
    const userData = (await getUserData(uid)) as UserData;
    return userData.isFreelancer || false;
  } catch (error) {
    console.error("Error fetching user information:", error);
    throw error; // Rethrow the error so the caller is aware that something went wrong.
  }
}

/**
 * Sends a message to a chat room.
 * @param {string} chatRoomId - The ID of the chat room.
 * @param {string} newMessage - The new message to be sent.
 * @param {string} [type="text"] - The type of message (default is "text").
 * @param {object} [metadata={}] - Additional metadata for the message (default is an empty object).
 */
export async function sendMessageToChat(
  chatRoomId,
  newMessage,
  type = "text",
  metadata = {},
  contractUpdateMetadata = {}
) {
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

  await addDoc(collection(db, CHATROOM_COLLECTION, chatRoomId, MESSAGES_COLLECTION), {
    charRoomId: chatRoomId,
    text: newMessage,
    createdAt: serverTimestamp(),
    uid: auth.currentUser.uid,
    read: readStatus,
    type: type,
    metadata: metadata,
    contractUpdateMetadata: contractUpdateMetadata,
  });
}

/**
 * Creates a new chat room between the current user and another user.
 * @param {string} toUserUid - The UID of the user to create the chat with.
 * @returns {Promise<[string, boolean]>} - A promise resolving to an array containing the chat room ID and a boolean indicating if the chat room was newly created.
 */
export async function createNewChat(toUserUid) {
  const chatRoomsRef = collection(db, CHATROOM_COLLECTION);
  const usersRef = collection(db, USERS_COLLECTION);

  let chatRoomId;

  const chatRoomsQuery = query(chatRoomsRef, where("members", "array-contains", auth.currentUser.uid));
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
        contractHistory: "noContract",
        currentContractId: null,
        status: "pending",
      });
      chatRoomId = chatRoomRef.id;
      const myUserDocRef = doc(usersRef, auth.currentUser.uid);
      const otherUserDocRef = doc(usersRef, toUserUid);

      await Promise.all([
        updateDoc(myUserDocRef, {
          chatRooms: arrayUnion(chatRoomId),
        }),
        updateDoc(otherUserDocRef, {
          chatRooms: arrayUnion(chatRoomId),
        }),
      ]);
      return [chatRoomId, true];
    }
  } catch (e) {
    console.log("Error", e);
  }
}

/**
 * Retrieves contract data from Firestore.
 * @param {string} contractId - The ID of the contract.
 * @returns {Promise<[ContractData, MilestoneData[] | null] | false>} - A promise resolving to an array containing the contract data and milestones data, or false if the contract doesn't exist or the user is not associated with it.
 */
export const getContractData = async (contractId) => {
  const contractRef = doc(db, CONTRACTS_COLLECTION, contractId);
  const docSnapshot = await getDoc(contractRef);

  if (docSnapshot.exists()) {
    if (
      docSnapshot.data().freelancerUid === auth.currentUser.uid ||
      docSnapshot.data().clientUid === auth.currentUser.uid
    ) {
      if (docSnapshot.data().previouslySaved) {
        const milestonesRef = collection(db, `contracts/${contractId}/milestones`);
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
        // Sort milestones by due date in ascending order
        const sortedMilestones = milestonesData.sort((a, b) => {
          const dateA = new Date(a.dueDate).getTime();
          const dateB = new Date(b.dueDate).getTime();
          return dateA - dateB;
        });

        return [docSnapshot.data(), sortedMilestones];
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

/**
 * Updates the status of a chat room in Firestore.
 * @param {string} chatRoomId - The ID of the chat room.
 * @param {string} newStatus - The new status to be set.
 * @returns {Promise<boolean>} - A promise resolving to true if the status is updated successfully, false otherwise.
 */
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

//////////////
//Interfaces
//////////////

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
  createdAt: Timestamp;
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
  about?: string;
  skills?: string[];
  province?: string;
  city?: string;
}

/**
 * Structure representing message data.
 */
export interface MessageData {
  id?: string;
  createdAt: Timestamp;
  text?: string;
  uid?: string;
  read?: {
    [uid: string]: boolean;
  };
  type?: ["contract", "text", "file", "chat-started", "status-update"];
  metadata?: FileMetadata;
  contractUpdateMetadata?: ContractUpdateMetadata;
}

export interface FileMetadata {
  contentType?: string;
  fileName?: string;
  caption?: string;
}

export interface ContractUpdateMetadata {
  contractId: string;
  milestoneId: string;
  milestoneTitle: string;
  milestoneAmount: number;
  type:
    | "milestone-funded"
    | "milestone-revision"
    | "milestone-submitted"
    | "milestone-paid"
    | "contract-ended"
    | "feedback-left";
}

/**
 * Structure representing chat room data.
 */
export interface ChatRoomData {
  id: string;
  members: string[];
  createdAt: Timestamp;
  createdBy: string;
  status: "pending" | "active" | "blocked" | "declined";
  contractHistory: "noContract" | "activeContract" | "completedContract";
  currentContractId?: string;
}

/**
 * Structure representing milestone data.
 */
export interface MilestoneData {
  id: string;
  title: string;
  amount: number;
  status?: "pending" | "paid" | "revision" | "submitted" | "refunded" | "proposed";
  dueDate: string;
  onEscrow?: boolean;
  proposedBy?: string;
}

/**
 * Structure representing contract data.
 */
export interface ContractData {
  id: string;
  chatRoomId: string;
  clientUid: string;
  freelancerUid: string;
  title: string;
  description: string;
  proposedBy: string;
  status: "pending" | "active" | "rejected" | "negotiating" | "accepted" | "ended";
  previouslySaved: boolean;
  feedbackStatus: {
    clientFeedback: boolean;
    freelancerFeedback: boolean;
  };
}

export interface FeedbackData {
  contractId: string;
  createdBy: string;
  forUser: string;
  rating: number;
  feedback: string;
  createdAt: Timestamp;
}