import React from "react";
/**
 * Interface for Message component props
 */
export interface FileMessageProps {
  id?: string;
  createdAt?: { seconds: number } | null;
  text?: string;
  userName?: string;
  photoURL?: string | null;
  uid?: string;
  metadata?: {};
}

const FileMessage: React.FC<FileMessageProps> = ({
  createdAt = null,
  text = "",
  userName = "",
  photoURL = null,
  uid = "",
  metadata = { file: "file" },
}) => {
  console.log(metadata);
  return <div>{text}</div>;
};

export default FileMessage;
