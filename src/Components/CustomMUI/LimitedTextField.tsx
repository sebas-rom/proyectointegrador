import { Stack, TextField, Typography, TextFieldProps } from "@mui/material";
import { useEffect, useState } from "react";

export type CustomTextFieldProps = {
  maxLength: number;
} & TextFieldProps;

const LimitedTextField = ({ maxLength, ...TextFieldProps }: CustomTextFieldProps) => {
  // Calculate the current character count
  const text = TextFieldProps.value as string;
  const [charCount, setCharCount] = useState(text.length);

  useEffect(() => {
    setCharCount(text.length);
  }, [text]);

  return (
    <>
      <TextField inputProps={{ maxLength: maxLength }} {...TextFieldProps} />
      <Stack width={"100%"}>
        <Typography variant="subtitle2" color={"gray"} textAlign={"right"}>
          {charCount}/{maxLength}
        </Typography>
      </Stack>
    </>
  );
};

export default LimitedTextField;
