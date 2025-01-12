## **NIST Password Validator Library**

A lightweight, zero-dependency open-source password validator adhering to NIST guidelines.

Try it out: [Test the library with a user-friendly front-end demo site.](https://nist-password-validator.netlify.app/)

---

### **Introduction**

This library provides a robust solution for password validation based on the [NIST Digital Identity Guidelines (SP 800-63B)](https://pages.nist.gov/800-63-4/sp800-63b.html). It promotes modern password security with support for Unicode, breach checks, customizable rules, and advanced features like error limits for flexible feedback.

---

### **Why NIST Guidelines?**

Passwords are a cornerstone of digital security. The National Institute of Standards and Technology (NIST) has established guidelines to improve password policies with principles like:

- **Minimum Length**: At least **8 characters**; **15+ recommended**.
- **Maximum Length**: Support up to **64+ characters**.
- **No Arbitrary Composition Rules**: Avoid forcing special characters or case mixing.
- **Unicode Support**: Inclusive acceptance of all Unicode characters.
- **Compromised Password Checks**: Block passwords found in breaches.
- **Blocklist with Fuzzy Matching**: Prevent predictable or context-specific terms.

This library implements these principles to enhance security and usability.

---

### **Features**

- **NIST-Compliant Validation**:
  - Unicode-based minimum/maximum length checks.
  - Smart whitespace handling.
- **Error Limiting**:
  - Control the number of errors returned for a password.
  - Balance detailed feedback and performance.
- **HIBP Integration**:
  - Check passwords against the **Have I Been Pwned (HIBP)** breach database.
- **Blocklist with Fuzzy Matching**:
  - Detect passwords similar to blocklisted terms.
  - Customizable sensitivity and matching rules.
- **Flexible Configuration**:
  - Adjustable length limits, blocklists, and sensitivity.
  - Toggle HIBP checks for local environments.

---

### **Installation**

Install via npm:

```bash
npm install nist-password-validator
```

---

### **Usage**

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
async function checkCustomPassword() {
  const result = await validatePassword("myp@ssw0rd!", {
    minLength: 10, // Custom minimum length (default: 15)
    maxLength: 500000, // Custom maximum length (default: 100K)
    hibpCheck: false, // Disable HIBP check if using local hash database
    blocklist: ["password"], // Custom blocklist
    matchingSensitivity: 0.2, // Custom matching sensitivity (default: 0.25)
    trimWhitespace: true, // Handle leading/trailing whitespace (default: true)
    errorLimit: 3, // Amount of errors to Check (defult: infinty) 
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

### **Error Limit Feature**

The `errorLimit` option allows users to control how many errors are returned during validation. This helps balance:

- **Performance**: Avoid unnecessary checks after reaching the limit.
- **Feedback**: Provide detailed insights without overwhelming users.

#### **Example Usage**

```typescript
const result = await validatePassword("mypassword", {
  errorLimit: 2, // Report up to 2 errors
});
console.log(result.errors); // Returns a maximum of 2 errors
```

- **Default**: Unlimited errors (`errorLimit` defaults to `Infinity`).
- **Customizable**: Adjust based on user needs or environment constraints.

---

### **Validators**

#### **1. Length Validation**

Ensures the password meets specified length requirements based on Unicode code points.

```typescript
import { lengthValidator } from "nist-password-validator";

const result = lengthValidator("mypassword", 8, 64);
console.log(result.errors);
```

#### **2. Blocklist Validation**

Prevents passwords that resemble blocked terms using fuzzy matching.

```typescript
import { blocklistValidator } from "nist-password-validator";

const result = blocklistValidator("myp@ssword", ["password"], {
  matchingSensitivity: 0.25,
});
console.log(result.errors);
```

#### **3. HIBP Validation**

Checks passwords against the **Have I Been Pwned** breach database.

```typescript
import { hibpValidator } from "nist-password-validator";

hibpValidator("mypassword123").then((result) => console.log(result.errors));
```

---

### **Whitespace Handling**

Handles leading/trailing whitespace in passwords for NIST compliance. Enabled by default.

```typescript
// Default: Trims whitespace
const result1 = await validatePassword("  mypassword  ");

// Disable trimming
const result2 = await validatePassword("  mypassword  ", { trimWhitespace: false });
```

---

### **Security Considerations**

- Normalize passwords to UTF-8 before hashing.
- Use local hash databases for HIBP checks in high-security environments.
- Customize blocklists with sensitive or organization-specific terms.
- Implement rate limiting for external API calls.

---

### **Contributing**

We welcome contributions! Fork the repo, create a branch, and submit a pull request. 

---

### **License**

This library is released under the [MIT License](LICENSE).
