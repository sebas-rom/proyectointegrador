// Check if the password has a number
const hasNumber = (password: string): boolean => /[0-9]/.test(password);

// Check if the password has a mix of lowercase and uppercase letters
const hasMixed = (password: string): boolean =>
  /[a-z]/.test(password) && /[A-Z]/.test(password);

// Check if the password has special characters
const hasSpecial = (password: string): boolean =>
  /[!@#$%^&*()\-+=._]/.test(password);

// Define type for password strength result
interface PasswordStrength {
  label: string;
  color: string;
}

// Set color based on password strength
export const strengthColor = (count: number): PasswordStrength => {
  if (count < 2) return { label: "Poor", color: "error.main" };
  if (count < 3) return { label: "Weak", color: "warning.main" };
  if (count < 4) return { label: "Normal", color: "warning.dark" };
  if (count < 5) return { label: "Good", color: "success.main" };
  if (count < 6) return { label: "Strong", color: "success.dark" };
  return { label: "Strong", color: "success.dark" }; // Default to strong if count exceeds 5
};

// Password strength indicator
export const strengthIndicator = (password: string): number => {
  let strengths = 0;
  if (password.length > 5) strengths += 1;
  if (password.length > 7) strengths += 1;
  if (hasNumber(password)) strengths += 1;
  if (hasSpecial(password)) strengths += 1;
  if (hasMixed(password)) strengths += 1;
  return strengths;
};
