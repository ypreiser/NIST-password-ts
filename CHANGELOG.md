# Changelog

All notable changes to this project are documented here.

## [2.0.2] - 2025-01-06
### Fixed
- empty string handling in blocklist

---

## [2.0.1] - 2024-12-31
### Added
- Improved the efficiency of the blocklist validator.
- Added a detailed example to the README for customizing the blocklist with personal information.

### Fixed
- Disabled minEditDistance to prevent false positives caused by short blocklist terms.
- Updated the README for better clarity and usage details.
- Adjusted the Levenshtein Distance algorithm to better handle UTF-8 characters.

---

## [2.0.0] - 2024-12-22
### Breaking Changes
- Removed `fuzzyTolerance` parameter.
- Replaced static fuzzy matching with a dynamic system.

### Added
- New blocklist validation configuration options:
  - `matchingSensitivity` 
  - `minEditDistance`
  - `maxEditDistance`
  - `customDistanceCalculator`
  - `trimWhitespace`
- Comprehensive documentation and examples for the new matching system.
- Improved handling of Unicode characters for blocklist validation.

- Optional whitespace trimming for passwords and blocklist terms
  - Enabled by default (NIST recommendation)
  - Configurable via `trimWhitespace` option


### Fixed
- Resolved an issue where short blocklist terms caused excessive false positives.

### Migration Guide
Users upgrading from `1.x.x` to `2.0.0` should:
1. Replace `fuzzyTolerance` with the new configuration options (`matchingSensitivity`, `minEditDistance`, `maxEditDistance`, or `customDistanceCalculator`).
2. Review and test existing blocklists to ensure compatibility with the new dynamic matching algorithm.
3. Update integration tests to align with the updated API.

---

## [1.0.7] - 2024-12-19
### Fixed
- Resolved a bug where short blocklist terms caused false positives.
- Updated README for better clarity.

---

## [1.0.6] - 2024-12-18
### Added
- Added padding for HIBP (Have I Been Pwned) API integration.

---

## [1.0.5] - 2024-12-17
### Fixed
- Minor corrections in the README.

---

## [1.0.4] - 2024-12-15
### Added
- New test cases for additional validation scenarios.
- Improved code documentation with JSDoc comment blocks.
- README updates for detailed usage examples.

---

## [1.0.3] - 2024-12-12
### Changed
- Terminology update: Replaced "blacklist" with "blocklist."
- Updated default maximum password length to 100K characters.

### Added
- Expanded test coverage with new cases.
- Added project keywords for discoverability.

---

## [1.0.2] - 2024-12-12
### Fixed
- Export issues resolved for smoother library usage.
- README corrections for consistency.

---

## [1.0.1] - 2024-12-12
### Changed
- Renamed the library file from `nist-password-validator.js` to `nist-password-validator`.

