import { format } from "date-fns";
import { doc, writeBatch } from "firebase/firestore";
import { auth, db } from "../../Contexts/Session/Firebase";

/**
 * Formats a given date into a string representing the day of the week and the day of the month.
 * If the provided date is null, returns "Today".
 * @param {number} seconds - The date to format
 * @returns {string} - The formatted date string
 */
export const formatMessageDate = (seconds: number | null): string => {
  return seconds ? format(seconds, "EEEE d") : "Today";
};

/**
 * Formats a given date into a string representing the time in 12-hour format.
 * If the provided date is null, returns h:mm a
 * @param {number} seconds - The date to format
 * @returns {string} - The formatted time string
 */
export const formatMessageTime = (seconds: number | null): string => {
  
  return seconds ? format(seconds * 1000, "h:mm a") : "h:mm a";
};

/**
 * Marks a list of unread messages as read in the specified chat room.
 * @param {Array<any>} unreadMessages - The list of unread messages
 * @param {string} room - The ID of the chat room
 */
export const markMessagesAsRead = async (
  unreadMessages: any[],
  room: string
): Promise<void> => {
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


/**
 * Generates a unique filename based on the original filename, current timestamp, and a random string.
 * @param {string} filename - The original filename
 * @returns {string} - The unique filename
 */
export const generateUniqueFileName = (filename: string): string => {
  const timestamp = new Date().getTime();
  const randomString = Math.random().toString(36).substring(2, 8);
  return `${filename}_${timestamp}_${randomString}`;
};
