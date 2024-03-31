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

export function isSameDay(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export const generateUniqueFileName = (filename) => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${filename}_${timestamp}_${randomString}`;
};