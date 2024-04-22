import { List } from "@mui/material";
import RepeatedListItemButton from "./RepeatedListItemButton";

/**
 * MessageListSkeleton component.
 *
 * This component represents a list of skeleton message items used for loading placeholders.
 *
 * @returns React JSX element representing a list of skeleton message items.
 */
function messageListSkeleton() {
  return (
    <List>
      {/* Render the RepeatedListItemButton component six times */}
      {[...Array(10)].map((_, index) => (
        <RepeatedListItemButton key={index} />
      ))}
    </List>
  );
}

export default messageListSkeleton;
