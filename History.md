## 1.0.7 (2014-07-25)

Features:

  - export ValidationException for use in try-catch blocks

## 1.0.6 (2014-01-26)

Features:

  - add History.md
  - add License.md
  - reorganize Readme.md

## 1.0.5 (2014-01-22)

Features

  - renamed dependency `congruent` to `deepequal`

## 1.0.4 (2014-01-22)

Bugfix:

  - fix global Buffer check

## 1.0.3 (2014-01-22)

Features:

  - use faster type-checking method
  - changed dependency `deep-is` to `congruent` for checking object equality

## 1.0.2 (2014-01-19)

Features:

  - add validators
    - object

## 1.0.1 (2014-01-17)

Features:

  - add validators
    - instanceOf
    - array
    - buffer
    - empty
  - add `or` condition to the Chain

## 1.0.0 (2014-01-16)

Features:

  - complete API rework
  - use getter methods instead of functions
  - renamed all methods from abbreviations to full names
  - add `deep-is` dependency for object equality checking
  - switched unit testing from `node-unit` to `mocha` and `should`
  - switched `is` from an instance to a singleton object
  
Removed:

  - common regular expression validation (email, url, alpha, alphanumeric, and ip)

## 0.0.1 (2013-05-08)

Initial publish