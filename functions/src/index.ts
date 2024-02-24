// /**
//  * Import function triggers from their respective submodules:
//  *
//  * import {onCall} from "firebase-functions/v2/https";
//  * import {onDocumentWritten} from "firebase-functions/v2/firestore";
//  *
//  * See a full list of supported triggers at https://firebase.google.com/docs/functions
//  */

// import { onRequest } from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";
// import { onDocumentCreated } from "firebase-functions/v2/firestore";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript

// // The Firebase Admin SDK to access Firestore.
// const { initializeApp } = require("firebase-admin/app");
// const { getFirestore } = require("firebase-admin/firestore");

// initializeApp();

// // Take the text parameter passed to this HTTP endpoint and insert it into
// // Firestore under the path /messages/:documentId/original
// exports.addmessage = onRequest(async (req, res) => {
//   // Grab the text parameter.
//   const original = req.query.text;
//   // Push the new message into Firestore using the Firebase Admin SDK.
//   const writeResult = await getFirestore()
//     .collection("messages")
//     .add({ original: original });
//   // Send back a message that we've successfully written the message
//   res.json({ result: `Message with ID: ${writeResult.id} added.` });
// });

const diacritics = require("diacritics");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const { FieldValue } = require("@google-cloud/firestore");

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
