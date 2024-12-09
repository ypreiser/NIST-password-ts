## **Password Validator Library**

### **Introduction**

This library provides a robust password validation solution based on the **NIST Digital Identity Guidelines (SP 800-63B)** for password security. It is designed to be secure, easy to use, and customizable, adhering to modern password validation practices, including checking against known data breaches and implementing Unicode-compliant password length validation.

---

### **Why NIST Guidelines?**

Passwords are often the weakest link in securing digital systems. To mitigate this, the National Institute of Standards and Technology (NIST) released updated recommendations for password policies. These include:

1. **Minimum Length**: Passwords should be at least **15 characters** to enhance resistance against brute-force attacks.
2. **Maximum Length**: Verifiers must support passwords up to **64 characters**.
3. **No Character Composition Rules**: Avoid enforcing arbitrary rules like requiring special characters or mixtures of uppercase/lowercase letters.
4. **Unicode Support**: Accept all Unicode characters, ensuring inclusivity and usability.
5. **Compromised Password Checks**: Block passwords that have appeared in previous data breaches.
6. **Blacklist with Fuzzy Matching**: Disallow passwords similar to commonly used or compromised terms (e.g., "password", "admin").

This library implements these principles to ensure secure and user-friendly password policies.

---

### **Features**

- **NIST-Compliant Validation**:
  - Minimum and maximum password length based on Unicode code points.
  - No arbitrary composition rules.
- **HIBP Integration**: Checks passwords against the **Have I Been Pwned (HIBP)** database to block known compromised passwords.
- **Blacklist with Fuzzy Matching**:
  - Identifies passwords similar to blacklisted terms.
  - Includes leetspeak transformations and fuzzy matching.
- **Customizable Rules**:
  - Adjustable password length limits.
  - Configurable blacklist and fuzzy tolerance.
  - Toggle HIBP checks.

---

### **Installation**

Install the library using npm:

```bash
npm install @yourorg/password-validator
```

---

### **Usage**

Here’s how to validate a password with the library:

#### **Basic Example**

```typescript
import { validatePassword } from '@yourorg/password-validator';

async function checkPassword() {
  const result = await validatePassword('examplepassword');
  if (!result.isValid) {
    console.log('Password validation failed:', result.errors);
  } else {
    console.log('Password is valid!');
  }
}

checkPassword();
```

#### **Custom Configuration**

```typescript
import { validatePassword } from '@yourorg/password-validator';

async function checkCustomPassword() {
  const result = await validatePassword('myp@ssw0rd!', {
    minLength: 10,             // Custom minimum length
    maxLength: 50,             // Custom maximum length
    hibpCheck: true,           // Check against HIBP (default: true)
    blacklist: ['password'],   // Custom blacklist
    fuzzyTolerance: 2,         // Custom fuzzy tolerance
  });

  if (!result.isValid) {
    console.log('Password validation failed:', result.errors);
  } else {
    console.log('Password is valid!');
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
   import { lengthValidator } from '@yourorg/password-validator/validators/lengthValidator';

   const result = lengthValidator('mypassword', 8, 64);
   console.log(result);
   ```

2. **Blacklist Validation**:
   - Detects passwords similar to blacklisted terms, including leetspeak and fuzzy matching.
   
   ```typescript
   import { blacklistValidator } from '@yourorg/password-validator/validators/blacklistValidator';

   const result = blacklistValidator('myp@ssw0rd!', ['password'], 3);
   console.log(result);
   ```

3. **HIBP Validation**:
   - Uses the **Have I Been Pwned** API to check for compromised passwords.
   
   ```typescript
   import { hibpValidator } from '@yourorg/password-validator/validators/hibpValidator';

   hibpValidator('mypassword123').then((result) => console.log(result));
   ```

---

### **Security Considerations**

1. **Use UTF-8 for Password Storage**:
   Ensure passwords are normalized to UTF-8 before hashing to prevent encoding mismatches.

2. **Hashing Before Sending to HIBP**:
   The HIBP validator hashes passwords using SHA-1 before sending the prefix of the hash to the API, ensuring no plaintext passwords are transmitted.

3. **Blacklist for Organizational Security**:
   Use the blacklist feature to prevent users from setting passwords similar to commonly used terms or organizationally sensitive words (e.g., "admin").

4. **Testing Fuzzy Matching**:
   Validate fuzzy matching rules to ensure they appropriately block passwords with minor variations.

5. **Protect API Usage**:
   Use rate-limiting and error-handling for HIBP API calls to prevent abuse or service interruptions.

---

### **Testing**

Use **Vitest** to run tests and ensure the library works as expected.

#### Run Tests:
```bash
npm test
```

#### Example Test Output:

```typescript
import { validatePassword } from '@yourorg/password-validator';

describe('Password Validation', () => {
  it('validates length requirements', async () => {
    const result = await validatePassword('short', { hibpCheck: false });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 15 characters.');
  });

  it('detects compromised passwords', async () => {
    const result = await validatePassword('password', { hibpCheck: true });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password has been compromised in a data breach.');
  });
});
```

---

### **Future Enhancements**

1. **Rate-Limiting HIBP Requests**:
   Add built-in rate-limiting to manage API calls efficiently in high-traffic systems.

2. **Customizable Validation Pipelines**:
   Allow users to define custom validation flows for specific use cases.

3. **Localization**:
   Add support for error messages in multiple languages.

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

