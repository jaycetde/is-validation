**Library for chaining validation and manipulation together**

This library is brand new and still under development. The API is still
changing and much of the library is untested.

This library provides a convienient way of validating and converting input
while providing easy to read and informative error messages if it fails.

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

toInt                    -> Number     // A number with excluding decimals
toDecimal                -> Number     // A number including decimals
toDate                   -> Date       // Parse a date using Date.parse
toNum                    -> Number     // A number
trim(val, [character])   -> String     // Trims specified characters from both sides of val
ltrim(val, [character])  -> String     // Trims the left side of val
rtrim(val, [character])  -> String     // Trims the right side of val
toBool                   -> Boolean    // Boolean
toStr                    -> String     // String value

```

This library is not yet on [npm](http://github.com/isaacs/npm)

More documentation will be available soon. In the meantime, look through the source code
and test file
