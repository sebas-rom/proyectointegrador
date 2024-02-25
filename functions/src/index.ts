import * as diacritics from "diacritics";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "@google-cloud/firestore";

admin.initializeApp();

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

exports.sendNotifications = functions.firestore
  .document("chatrooms/{chatroomId}/messages/{messageId}")
  .onCreate(async (snapshot, context) => {
    const message = snapshot.data();
    const chatroomId = context.params.chatroomId;

    // Retrieve the chatroom document to get the members array.
    const chatroomRef = admin
      .firestore()
      .collection("chatrooms")
      .doc(chatroomId);
    const chatroomSnapshot = await chatroomRef.get();
    const chatroomData = chatroomSnapshot.data();

    if (chatroomData && chatroomData.members) {
      // Set read status to false for all members except the sender
      const readMap = {};
      chatroomData.members.forEach((memberUid) => {
        if (memberUid !== message.uid) {
          readMap[memberUid] = false;
        }
      });

      // Update the 'read' field of the message. Note that this code assumes
      // that 'read' is a map field in your message documents.
      return snapshot.ref.update({ read: readMap });
    } else {
      console.log(
        `Chatroom with ID: ${chatroomId} does not exist or has no members.`
      );
      return null;
    }
  });

