import { Avatar, Skeleton } from "@mui/material";
import { useState } from "react";
import { SxProps } from "@mui/material";
/**
 * Generates a color based on a given string value.
 * The color is determined by converting each character of the string into a color code.
 *
 * @param {string} string - The string value used to generate a color.
 * @returns {string} A string representing a hexadecimal color.
 */
function stringToColor(string: string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

/**
 * Creates style props for an MUI Avatar component, including a background color
 * derived from the provided username and sizing based on the avatar size specified.
 *
 * @param {string} name - The name to use for generating the avatar initials and background color.
 * @param {string | number} avatarSize - The size of the avatar, which controls its width and height.
 * @returns {object} An object containing the sx styling and children properties for an Avatar component.
 */
function stringAvatar(name = "", avatarSize) {
  // Ensure name is a valid string
  if (!name) {
    name = "";
  }

  const nameParts = name.split(" ");
  let initials;

  if (nameParts.length > 1) {
    // There are at least two words in the name
    initials = `${nameParts[0][0]}${nameParts[1][0]}`;
  } else {
    // There is only one word in the name
    initials = `${nameParts[0][0]}`;
  }

  return {
    sx: {
      bgcolor: stringToColor(name), // Assuming stringToColor is a function that you've defined elsewhere
      width: avatarSize,
      height: avatarSize,
    },
    children: initials,
  };
}

export interface ColoredAvatarProps {
  // The name of the user to generate the avatar for
  userName?: string;
  // The URL of the user's profile photo
  photoURL?: string;
  // The size of the avatar
  size?: "small" | "medium" | "large";
  // Additional custom styles for the Avatar component
  sx?: SxProps;
}

/**
 * A functional component that renders a Material-UI Avatar with a dynamically
 * generated background color based on the userName prop, or an image if the
 * photoURL prop is provided. The component's size can be configured with the size prop.
 *
 * @param {ColoredAvatarProps} props - An object with props including userName, photoURL, and size.
 * @returns {JSX.Element} A JSX element of the Avatar with the dynamic styling applied.
 */
const ColoredAvatar: React.FC<ColoredAvatarProps> = ({
  userName = "",
  photoURL = null,
  size = "medium",
  sx = {},
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const avatarSize =
    size === "small" ? "30px" : size === "medium" ? "45px" : "130px";

  const avatarStyles = {
    width: avatarSize,
    height: avatarSize,
    ...sx, // Merge custom sx styles
  };

  return (
    <>
      {photoURL ? (
        <>
          {!imageLoaded && (
            <Skeleton
              variant="circular"
              animation="wave"
              width={avatarSize}
              height={avatarSize}
            />
          )}
          <Avatar
            sx={avatarStyles}
            style={{ display: imageLoaded ? "flex" : "none" }}
          >
            <img
              src={photoURL}
              alt={userName}
              width="100%"
              height="100%"
              onLoad={() => setImageLoaded(true)}
              style={{ display: "block", backgroundColor: "white" }} // Ensures the img tag fills the parent Avatar component
            />
          </Avatar>
        </>
      ) : (
        <Avatar {...stringAvatar(userName, avatarSize)} />
      )}
    </>
  );
};

export default ColoredAvatar;
