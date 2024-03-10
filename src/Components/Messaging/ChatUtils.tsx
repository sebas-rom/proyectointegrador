import { format } from "date-fns";
import { doc, writeBatch } from "firebase/firestore";
import { auth, db } from "../../Contexts/Session/Firebase";

export const formatMessageDate = (date) => {
  return date ? format(date, "EEEE d") : "Today";
};

export const markMessagesAsRead = async (unreadMessages, room) => {
  const batch = writeBatch(db);
  unreadMessages.forEach((message) => {
    const messageRef = doc(db, "chatrooms", room, "messages", message.id);
    batch.update(messageRef, {
      [`read.${auth.currentUser.uid}`]: true,
    });
  });

  try {
    await batch.commit();
  } catch (error) {
    console.error("Error marking messages as read: ", error);
  }
};
