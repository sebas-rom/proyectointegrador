import * as diacritics from "diacritics";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "@google-cloud/firestore";
// import { onCustomEventPublished } from "firebase-functions/v2/eventarc";
// import { getDownloadURL } from "firebase-admin/storage";
// admin.initializeApp();
// const storage = admin.storage();

// import { initializeApp, cert } from "firebase-admin/app";

// const serviceAccount = require("../cert/free-ecu-firebase-adminsdk-9jhrg-c071af1e23.json");

admin.initializeApp();

// initializeApp({
//   credential: cert(serviceAccount),
//   storageBucket: "free-ecu.appspot.com",
// });

// const bucket = getStorage().bucket();

exports.addUserToFirestore = functions.auth.user().onCreate(async (user) => {
  const usersRef = admin.firestore().collection("users");
  const userDocRef = usersRef.doc(user.uid);

  let normalizedName = null;
  if (user.displayName) {
    normalizedName = diacritics.remove(user.displayName).toLowerCase();
  }

  await userDocRef.set({
    uid: user.uid,
    createdAt: FieldValue.serverTimestamp(),
    firstName: user.displayName || "",
    lastName: "",
    photoURL: user.photoURL || "",
    searchableFirstName: normalizedName || "",
    searchableLastName: normalizedName || "",
    signUpCompleted: false,
  });

  console.log(`New user ${user.uid} added to Firestore.`);
});

// exports.handleImageResize = onCustomEventPublished(
//   "firebase.extensions.storage-resize-images.v1.onSuccess",
//   async (e) => {
//     // Extract folder and filename from the input path
//     const input = e.data.input.name;
//     const parts = input.split("/");
//     const folder = parts.slice(0, -1).join("/"); // Get the folder path
//     const filename = parts.slice(-1)[0]; // Get the filename
//     const output = e.data.outputs[0].outputFilePath;
//     if (folder === "users/avatars") {
//       console.log("Resize image for user avatar");
//       const uid = filename.split(".")[0];
//       try {
//         const thumbDownloadURL =
//           "https://storage.googleapis.com/free-ecu.appspot.com/" + output;
//         // Update the document with the same UID inside the users collection
//         await admin.firestore().collection("users").doc(uid).update({
//           thumbDownloadURL: thumbDownloadURL,
//         });
//         console.log("User avatar updated successfully.");
//       } catch (error) {
//         console.error("Error updating user avatar:", error);
//       }
//     } else if (folder === "messages/images") {
//       console.log("Resize image for message image");
//     }
//   }
// );

