# Password Validation Library

This library provides utilities for password validation with customizable options, including length validation, character set restrictions, blacklist checks, and integration with Have I Been Pwned (HIBP) for breach detection.

## Features

- **Length Validation:** Enforce minimum and maximum password lengths.
- **Character Set Validation:** Restrict passwords to allowed characters.
- **Blacklist Validation:** Check passwords against a custom blacklist with optional fuzzy tolerance.
- **HIBP Integration:** Check if a password has been exposed in breaches (optional).

## Installation

```bash
npm install password-validator-lib
Usage
Import the validatePassword function and customize validation options:

import { validatePassword } from 'password-validator-lib';

const options = {
  minLength: 8,
  maxLength: 64,
  allowedCharacterSet: /^[a-zA-Z0-9!@#$%^&*()]+$/,
  blacklist: ['123456', 'password', 'qwerty'],
  hibpCheck: true,
};

const result = await validatePassword('YourPassword123!', options);

console.log(result.isValid); // true or false
console.log(result.errors); // List of validation errors
Options
minLength (number): Minimum password length (default: 8).
maxLength (number): Maximum password length (default: 64).
allowedCharacterSet (RegExp): Regular expression for allowed characters.
blacklist (string[]): List of blacklisted passwords.
hibpCheck (boolean): Enable HIBP check (default: true).
fuzzyTolerance (number): Allow fuzzy matching for blacklisted passwords (default: 3).
Running Tests
Run the test suite to ensure functionality:

npm test
License
MIT License