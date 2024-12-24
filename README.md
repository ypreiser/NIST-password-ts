## **NIST Password Validator Library**

A lightweight, zero-dependencies open-source password validator according to NIST guidelines.

Try it out: [Test the library with a user-friendly front-end demo site.](https://nist-password-validator.netlify.app/)

### **Introduction**

This library provides a robust password validation solution based on the [NIST Digital Identity Guidelines (SP 800-63B)](https://pages.nist.gov/800-63-4/sp800-63b.html). It ensures modern password security with support for Unicode, known data breach checks, and customizable validation rules.

---

### **Why NIST Guidelines?**

Passwords are a critical aspect of digital security. The National Institute of Standards and Technology (NIST) has established recommendations to improve password policies. Key principles include:

1. **Minimum Length**: Passwords should be at least **8 characters** (15 characters or more recommended) to enhance resistance against brute-force attacks.
2. **Maximum Length**: Verifiers must support passwords up to **64 characters** at least, the more the better. Although Extremely long passwords (perhaps megabytes long) could require excessive processing time to hash, so it is reasonable to impose a limit.
3. **No Character Composition Rules**: Avoid enforcing arbitrary rules like requiring special characters or mixtures of uppercase/lowercase letters.
4. **Unicode Support**: Accept all Unicode characters, ensuring inclusivity and usability.
5. **Compromised Password Checks**: Block passwords that have appeared in previous data breaches.
6. **Blocklist with Fuzzy Matching**: Disallow passwords similar to predictable or commonly used terms:
   - Company-specific terms
   - Context-specific phrases (e.g., project name).

This library implements these principles to ensure secure and user-friendly password policies.

---

### **Features**

- **NIST-Compliant Validation**:
  - Minimum and maximum password length based on Unicode code points.
  - No arbitrary composition rules.
  - Smart whitespace handling following NIST recommendations.
- **HIBP Integration**: Checks passwords against the **Have I Been Pwned (HIBP)** database to block known compromised passwords.
- **Blocklist with Fuzzy Matching**:
  - Identifies passwords similar to blocklisted terms.
  - Includes leetspeak transformations and fuzzy matching.
  - Advanced matching with configurable sensitivity.
- **Customizable Rules**:
  - Adjustable password length limits.
  - Configurable blocklist and fuzzy tolerance.
  - Toggle HIBP checks for using local hash databases.
  - Optional whitespace trimming.

---

### **Installation**

Install the library using npm:

```bash
npm install nist-password-validator
```

---

### **Usage**

To ensure a seamless integration of the NIST Password Validator Library in both front-end and back-end applications, it is crucial to install the library in both environments. This allows for consistent password validation rules across your entire application, enhancing security and user experience.

By installing the library in both environments, you ensure that password validation is handled uniformly, reducing the risk of discrepancies and potential security vulnerabilities.

Here's how to validate a password with the library:

#### **Basic Example**

```typescript
import { validatePassword } from "nist-password-validator";

async function checkPassword() {
  const result = await validatePassword("examplepassword");
  if (!result.isValid) {
    console.log("Password validation failed:", result.errors);
  } else {
    console.log("Password is valid!");
  }
}

checkPassword();
```

#### **Custom Configuration**

```typescript
import { validatePassword } from "nist-password-validator";

async function checkCustomPassword() {
  const result = await validatePassword("myp@ssw0rd!", {
    minLength: 10, // Custom minimum length (default: 15)
    maxLength: 500000, // Custom maximum length (default: 100K)
    hibpCheck: false, // Disable HIBP check if using local hash database
    blocklist: ["password"], // Custom blocklist
    matchingSensitivity: 0.2, // Custom matching sensitivity (default: 0.25)
    trimWhitespace: true, // Handle leading/trailing whitespace (default: true)
  });

  if (!result.isValid) {
    console.log("Password validation failed:", result.errors);
  } else {
    console.log("Password is valid!");
  }
}

checkCustomPassword();
```

---

### **Validators**

1. **Length Validation**:

   - Ensures the password's length is between the specified minimum and maximum.
   - Counts Unicode code points instead of raw bytes to ensure inclusivity.

   ```typescript
   import { lengthValidator } from "nist-password-validator";

   const result = lengthValidator("mypassword", 8, 64);
   console.log(result);
   ```

2. **Blocklist Validation**:
   The blocklist validator prevents passwords that are similar to commonly used or forbidden terms. It implements an intelligent fuzzy matching system that adapts to term length for optimal security.

   ```typescript
   import { blocklistValidator } from "nist-password-validator";

   interface BlocklistOptions {
     matchingSensitivity?: number; // Default: 0.25 - Controls how strict the matching is
     minEditDistance?: number; // Default: 0 - Minimum allowed character differences 
     maxEditDistance?: number; // Default: 5 - Maximum allowed character differences
     customDistanceCalculator?: (term: string, password: string) => number;
     trimWhitespace?: boolean; // Default: true - Enables trimming of whitespace from blocklist terms
   }

   // Basic usage
   const result = blocklistValidator("myp@ssw0rd!", ["password"], {
     matchingSensitivity: 0.25,
   });

   // Exact matching (no fuzzy matching)
   const exactResult = blocklistValidator("myp@ssw0rd!", ["password"], {
     matchingSensitivity: 0,
     minEditDistance: 0,
   });

   // Custom distance calculation
   const customResult = blocklistValidator("mypassword", ["password"], {
     customDistanceCalculator: (term, password) => {
       return term.length < 5 ? 1 : Math.floor(term.length * 0.3);
     },
   });
   ```

   **How Matching Works**:

   - **Default Behavior**: The allowed difference between password and blocklist terms is calculated as: `term.length × matchingSensitivity`
   - **Bounds**: The result is constrained between `minEditDistance` and `maxEditDistance`
   - **Exact Matching**: Set both `matchingSensitivity` and `minEditDistance` to 0
   - **Custom Logic**: Provide a `customDistanceCalculator` for complete control

3. **HIBP Validation**:

   - Uses the **Have I Been Pwned** API to check for compromised passwords.
   - Implements k-anonymity and padding for enhanced security and privacy protection.

   ```typescript
   import { hibpValidator } from "nist-password-validator";

   hibpValidator("mypassword123").then((result) => console.log(result));
   ```

---

### **Whitespace Handling**

Following NIST Digital Identity Guidelines (SP 800-63B), the library provides smart handling of whitespace in passwords:

#### **Behavior**:

- When `trimWhitespace` is true (default):
  - Removes leading and trailing whitespace from passwords
  - Also trims blocklist terms for consistent matching
  - Length validation occurs after trimming
  - Maintains NIST compliance for minimum length requirements

#### **Examples**:

```typescript
// Default behavior (trimming enabled)
const result1 = await validatePassword("  mypassword  "); // Validates "mypassword"

// Disable trimming
const result2 = await validatePassword("  mypassword  ", {
  trimWhitespace: false,
}); // Validates with spaces included

// Blocklist validation with trimming
const result3 = blocklistValidator("  password123  ", ["  password  "], {
  trimWhitespace: true,
}); // Trims both password and blocklist terms
```

---

### **Security Considerations**

1. **Use UTF-8 for Password Storage**:
   Ensure passwords are normalized to UTF-8 before hashing to prevent encoding mismatches.

2. **Hashing Before Sending to HIBP**:
   The HIBP validator implements k-anonymity with padding when checking passwords:

   - Passwords are hashed using SHA-1 locally.
   - Only a prefix of the hash is sent to the API.
   - Responses include padding to enhance security and privacy.
   - No plaintext passwords are ever transmitted.

3. **Blocklist Security**:

   - Use organization-specific terms in the blocklist
   - Consider password length when setting matching sensitivity
   - Test fuzzy matching with common variations of blocked terms
   - Set appropriate min/max edit distances for your security needs
   - Use exact matching (sensitivity = 0, minEditDistance = 0) for critical terms

4. **API Protection**:

   - Implement rate limiting for HIBP API calls
   - Handle API errors gracefully
   - Consider using a local hash database for high-security environments

5. **Whitespace Handling**:
   - Trimming whitespace helps prevent user errors
   - Length validation occurs after trimming
   - Consider disabling trimming for systems requiring exact password matching
   - Ensure consistent whitespace handling across all system components

---

### **Contact**

For any questions or support, please contact me at: [ypreiser@gmail.com](mailto:ypreiser@gmail.com)

---

### **Contributing**

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch.
3. Write clear, maintainable code with appropriate comments.
4. Submit a pull request for review.

---

### **License**

This library is released under the [MIT License](LICENSE).
