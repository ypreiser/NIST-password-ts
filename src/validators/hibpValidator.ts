// src\validators\hibpValidator.ts

import { ValidationResult } from "../types";
const API_URL = "https://api.pwnedpasswords.com/range/";

/**
 * Checks if the given password has been exposed in a data breach.
 * @param {string} password - The password to check.
 * @returns {Promise<ValidationResult>} - `true` if the password is found in breaches, otherwise `false`.
 */
export async function hibpValidator(
  password: string
): Promise<ValidationResult> {
  try {
    const sha1 = await generateSHA1(password);
    const prefix = sha1.substring(0, 5);
    const suffix = sha1.substring(5);

    const response = await fetch(`${API_URL}${prefix}`, {
      method: "GET",
      headers: {
        "User-Agent": "NIST-password-validator-ts",
        "Add-Padding": "true",
      },
    });
    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(
        `Failed to check password against HaveIBeenPwned API. Status: ${response.status}, Details: ${errorDetails}`
      );
    }

    const text = await response.text();
    const lines = text.split("\n");

    // Filter and check if the suffix is present with a count > 0
    const found = lines.some((line) => {
      const [hashSuffix, count] = line.split(":");
      return hashSuffix.trim() === suffix && parseInt(count.trim(), 10) > 0;
    });

    return found
      ? {
          isValid: false,
          errors: ["Password has been compromised in a data breach."],
        }
      : { isValid: true, errors: [] };
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error("Error during password breach check:", errorMessage);
    throw new Error(`HaveIBeenPwned check failed: ${errorMessage}`);
  }
}

/**
 * Generates a SHA-1 hash for the given password.
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - The SHA-1 hash of the password.
 */
async function generateSHA1(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => (b < 16 ? "0" : "") + b.toString(16))
    .join("")
    .toUpperCase();
}
