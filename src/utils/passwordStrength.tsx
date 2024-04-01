/**
 * Check if the password has a number.
 * @param password - The password to be checked.
 * @returns Returns true if the password contains a number, otherwise false.
 */
const hasNumber = (password: string): boolean => /[0-9]/.test(password);

/**
 * Check if the password has a mix of lowercase and uppercase letters.
 * @param password - The password to be checked.
 * @returns Returns true if the password contains a mix of lowercase and uppercase letters, otherwise false.
 */
const hasMixed = (password: string): boolean =>
  /[a-z]/.test(password) && /[A-Z]/.test(password);

/**
 * Check if the password has special characters.
 * @param password - The password to be checked.
 * @returns Returns true if the password contains special characters, otherwise false.
 */
const hasSpecial = (password: string): boolean =>
  /[!@#$%^&*()\-+=._]/.test(password);

/**
 * Interface representing the result of password strength.
 */
interface PasswordStrength {
  label: string;
  color: string;
}

/**
 * Determine the color representation based on the password strength count.
 * @param count - The strength count of the password.
 * @returns Returns an object containing the label and color representing the password strength.
 */
export const strengthColor = (count: number): PasswordStrength => {
  if (count < 2) return { label: "Poor", color: "error.main" };
  if (count < 3) return { label: "Weak", color: "warning.main" };
  if (count < 4) return { label: "Normal", color: "warning.dark" };
  if (count < 5) return { label: "Good", color: "success.main" };
  if (count < 6) return { label: "Strong", color: "success.dark" };
  return { label: "Strong", color: "success.dark" }; // Default to strong if count exceeds 5
};

/**
 * Calculate the strength of a password based on various criteria.
 * @param password - The password to be evaluated.
 * @returns Returns the strength count of the password.
 */
export const strengthIndicator = (password: string): number => {
  let strengths = 0;
  if (password.length > 5) strengths += 1;
  if (password.length > 7) strengths += 1;
  if (hasNumber(password)) strengths += 1;
  if (hasSpecial(password)) strengths += 1;
  if (hasMixed(password)) strengths += 1;
  return strengths;
};
