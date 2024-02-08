import Avatar from "@mui/material/Avatar";

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

interface ColoredAvatarProps {
  userName?: string;
  photoURL?: string;
  size?: "small" | "medium" | "large";
}

const ColoredAvatar: React.FC<ColoredAvatarProps> = ({
  userName = "",
  photoURL = null,
  size = "medium",
}) => {
  const avatarSize =
    size === "small" ? "30px" : size === "medium" ? "45px" : "55px";
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
