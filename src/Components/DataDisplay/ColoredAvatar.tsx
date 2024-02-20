import Avatar from "@mui/material/Avatar";

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

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

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
function stringAvatar(name: string, avatarSize) {
  return {
    sx: {
      bgcolor: stringToColor(name),
      width: avatarSize,
      height: avatarSize,
    },
    children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
  };
}

export interface ColoredAvatarProps {
  userName?: string;
  photoURL?: string;
  size?: "small" | "medium" | "large";
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
}) => {
  const avatarSize =
    size === "small" ? "30px" : size === "medium" ? "45px" : "100px";

  return (
    <>
      {photoURL ? (
        <Avatar src={photoURL} sx={{ width: avatarSize, height: avatarSize }} />
      ) : (
        <Avatar {...stringAvatar(userName, avatarSize)} />
      )}
    </>
  );
};

export default ColoredAvatar;
