import { format } from "date-fns";

export const formatMessageDate = (date) => {
  return date ? format(date, "EEEE d") : "Today";
};
