## **NIST Password Validator Library**

### **Introduction**

This library provides a robust password validation solution based on the [NIST Digital Identity Guidelines (SP 800-63B)](https://pages.nist.gov/800-63-4/sp800-63b.html) for password security. It is designed to be secure, easy to use, and customizable, adhering to modern password validation practices, including checking against known data breaches and implementing Unicode-compliant password length validation.

---

### **Why NIST Guidelines?**

Passwords are often the weakest link in securing digital systems. To mitigate this, the National Institute of Standards and Technology (NIST) released updated recommendations for password policies. These include:

1. **Minimum Length**: Passwords should be at least **15 characters** to enhance resistance against brute-force attacks.
2. **Maximum Length**: Verifiers must support passwords up to **64 characters**.
3. **No Character Composition Rules**: Avoid enforcing arbitrary rules like requiring special characters or mixtures of uppercase/lowercase letters.
4. **Unicode Support**: Accept all Unicode characters, ensuring inclusivity and usability.
5. **Compromised Password Checks**: Block passwords that have appeared in previous data breaches.
6. **Blocklist with Fuzzy Matching**: Disallow passwords similar to commonly used or compromised terms (e.g., "password", "admin").

This library implements these principles to ensure secure and user-friendly password policies.

---

### **Features**

- **NIST-Compliant Validation**:
  - Minimum and maximum password length based on Unicode code points.
  - No arbitrary composition rules.
- **HIBP Integration**: Checks passwords against the **Have I Been Pwned (HIBP)** database to block known compromised passwords.
- **Blocklist with Fuzzy Matching**:
  - Identifies passwords similar to blocklisted terms.
  - Includes leetspeak transformations and fuzzy matching.
- **Customizable Rules**:
  - Adjustable password length limits.
  - Configurable blocklist and fuzzy tolerance.
  - Toggle HIBP checks.

---

### **Installation**

Install the library using npm:

```bash
npm install nist-password-validator.ts
```

---

### **Usage**

Here’s how to validate a password with the library:

#### **Basic Example**

```typescript
import { validatePassword } from "@yourorg/password-validator";

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
import { validatePassword } from "@yourorg/password-validator";

async function checkCustomPassword() {
  const result = await validatePassword("myp@ssw0rd!", {
    minLength: 10, // Custom minimum length (default : 15)
    maxLength: 50, // Custom maximum length(default : 64)
    hibpCheck: true, // Check against HIBP (default: true)
    blocklist: ["password"], // Custom blocklist
    fuzzyTolerance: 2, // Custom fuzzy tolerance (default: 3)
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
   import { lengthValidator } from "nist-password-validator.ts";

   const result = lengthValidator("mypassword", 8, 64);
   console.log(result);
   ```

2. **Blocklist Validation**:

   - Detects passwords similar to blocklisted terms, including leetspeak and fuzzy matching.

   ```typescript
   import { blocklistValidator } from "nist-password-validator.ts";

   const result = blocklistValidator("myp@ssw0rd!", ["password"], 3);
   console.log(result);
   ```

3. **HIBP Validation**:

   - Uses the **Have I Been Pwned** API to check for compromised passwords.

   ```typescript
   import { hibpValidator } from "nist-password-validator.ts";

   hibpValidator("mypassword123").then((result) => console.log(result));
   ```

---

### **Security Considerations**

1. **Use UTF-8 for Password Storage**:
   Ensure passwords are normalized to UTF-8 before hashing to prevent encoding mismatches.

2. **Hashing Before Sending to HIBP**:
   The HIBP validator hashes passwords using SHA-1 before sending the prefix of the hash to the API, ensuring no plaintext passwords are transmitted.

3. **Blocklist for Organizational Security**:
   Use the blocklist feature to prevent users from setting passwords similar to commonly used terms or organizationally sensitive words (e.g., "admin").

4. **Testing Fuzzy Matching**:
   Validate fuzzy matching rules to ensure they appropriately block passwords with minor variations.

5. **Protect API Usage**:
   Use rate-limiting and error-handling for HIBP API calls to prevent abuse or service interruptions.

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
