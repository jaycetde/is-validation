**Library for chaining validation and manipulation together**

This library is brand new and still under development. The API is still
changing and much of the library is untested.

This library provides a convienient way of validating and converting input
while providing easy to read and informative error messages.

## Examples

```javascript

var is = require('is');

// basic usage
is.num(123);                          // true
is.gt(123, 100);                      // false

// simple chaining
is.that(123)
  .num()
  .gt(100);

is.valid();                           // false
is.errCount();                        // 1
is.testCount();                       // 2

// complex chaining
var chain = is.that("hello world");
chain
  .str()
  .prop('length')
    .gt(10)
    .lt(20)
    .up()
  .match(/^[a-z ]+$/i);
  
chain.valid();                        // true
is.valid();                           // false (still false from simple chaining example)

chain.errCount();                     // 0
is.errCount();                        // 1

chain.testCount();                    // 4
is.testCount();                       // 6

is.clear();

```

Error messages are more informative than simply stating 'invalid input'

```javascript

is.that('$ab', 'Your username')
        .str()
        .alpha()                      // fails
        .prop('length')
                .gt(5)                // fails
                .lt(15);

is.errorMessages();
// ['Your username must only be alphabetic characters and have a length which must be greater than 5']

```

## Methods:

These methods are available from Is and from all chains. A chain will automatically fill in the first
argument as its value.

## Validation methods:

```javascript

str(val)                 // string
num(val)                 // numeric
lt(val, limit)           // less than
gt(val, limit)           // greater than
lte(val, limit)          // less than or equal
gte(val, limit)          // greater than or equal
bt(val, lower, upper)    // between
date(val)
lObj(val)                // literal object ( {} || new Object )
match(val, regexp)       // matches a Regular Expression
eq(val, valb)            // equal (val == valb)
sEq(val, valb)           // strict equal (val === valb)
sBool(val)               // strict boolean
inside(val, obj)         // in array or string
has(val, propName)       // val has property 'propName'
sNum(val)                // strict number
fn(val)                  // function
args(val)                // arguments
sDate(val)               // strict date
regExp(val)              // regular expression
email(val)               // valid email
url(val)                 // valid url
ip(val)                  // valid ip address
alpha(val)               // alphabetic characters
alphaNumeric(val)        // alphanumeric characters

```

## Manipulation methods:

```javascript

toInt(val)               -> Number     // A number with excluding decimals
toDecimal(val)           -> Number     // A number including decimals
toDate(val)              -> Date       // Parse a date using Date.parse
toNum(val)               -> Number     // A number
trim(val, [character])   -> String     // Trims specified characters from both sides of val
ltrim(val, [character])  -> String     // Trims the left side of val
rtrim(val, [character])  -> String     // Trims the right side of val
toBool(val)              -> Boolean    // Boolean
toStr(val)               -> String     // String value

```

## Adding custom validations:

Custom methods should have a failMessage property for use in chain error message construction

```javascript

var even = function (val) {
	return val % 2 === 0;
};
even.failMessage = 'be even';

Is.addTest('even', even);

Is.even(3);              // false

Is.that(3)
	.even()
	.valid();              // false

```

## Adding custom manipulations:

If a manipulation method can fail, a failVal and failMessage property should be added to the function.
The failVal may be a validation function. If the manipulation fails, an error is added and the rest of
the chain validators and manipulators are bypassed.

```javascript

var multiply = function (val, multiplier) {
	return val * multiplier
};
multiply.failVal = isNaN; // Use builtin isNaN function to validate
multiply.failMessage = 'be a finite number';

Is.addManip('multiply', multiply);

Is.multiply(2, 4);        // 8

Is.that(2)
	.multiply(4)
	.val();                 // 8

Is.that('abc')
	.multiply(4)            // fails with NaN
	.gt(10)                 // bypasses this and future tests
	.errCount();            // 1 - only failed multiply method

```

## Is.prototype

```javascript

that = function (val, name);        // Creates a new chain focused on val
addTest = function (name, fn);      // Adds a validation method to Is and Chain prototype
addManip = function (name, fn);     // Adds a manipulation method to Is and Chain prototype
errorMessages = function ();        // Returns an array of error messages, if any
testCount = function ();            // Returns the number of tests ran in this instance
errCount = function ();             // Returns the number of errors that have occurred in this instance
clear = function ();                // Clears out the errors and tests for this instance
valid = function ();                // Returns true if there are no errors in this instance
throwErrs = function ();            // Throws an exception if there are any errors. exception.messages = this.errorMessages()
create = function ();               // Creates and returns a new instance of Is

```

## Chain.prototype

```javascript

errorFormat = function (format);    // set the error format for the chain. Default: '{0} must {1}'
propFormat = function (format);     // set the property error format for the chain. Default: 'have a {0} which must {1}'
prop = function (prop, name);       // Create a sub-chain focused on the current values property 'prop'
manip = function (fn, name);        // Create a sub-chain focused on fn's return value
test = function (fn, failMessage);  // Runs a test function without adding it to Chain.prototype
replace = function (val, comparator); // Replaces the current value if it equals the comparator
stop = function ();                 // Starts bypassing the chain
resume = function ();               // Stops bypassing the chain and resume testing
not = function ();                  // Negates the following test. Ex: is.that(123).not().str().valid() -> true
stopIfErrs = function ();           // Starts bypassing the chain if there are errors
up = function ();                   // Returns the current chain's parent
val = function ();                  // Returns the chain's current value
clear = function ();                // Clears out error and test information
errorMessage = function ();         // Returns a constructed error message if there are errors
testCount = function ();            // Returns the number of tests ran in this chain
errCount = function ();             // Returns the number of errors that have occurred in this chain
valid = function ();                // Return true if there are no errors in this chain
throwErr = function ();             // Throws an exception if there are any errors. exception.message = this.errorMessage()

```

This library is not yet on [npm](http://github.com/isaacs/npm)

More documentation will be available soon. In the meantime, look through the source code
and test file
