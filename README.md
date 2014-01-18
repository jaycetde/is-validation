## is-validation

Library for chaining validation and manipulation together

**This library is brand new and still under development. The API is still
changing.**

This library provides a convienient way of validating and converting input
while providing easy to read and informative error messages.

### Example

```javascript

var is = require('is');

// static validation usage
is.number(123);
// true
is.lessThan(123, 100);
// false

// simple chaining
is(123)
  .number()
  .lessThan(100)
;

is.valid;
// false
is.errorCount;
// 1
is.testCount;
// 2

// complex chaining
var chain = is("hello world");
chain
  .string()
  .property('length')
    .greaterThan(10)
    .lessThan(20)
    .up() // go back to parent chain
  .match(/^[a-z ]+$/i)
;

chain.valid;
// true
is.valid;
// false (still false from simple chaining example)

chain.errorCount;
// 0
is.errorCount;
// 1

chain.testCount;
// 4
is.testCount;
// 6

is.clear();

is.valid;
// true
is.testCount;
// 0
is.errorCount;
// 0

```

### Installation

    $ npm install is-validation
    
### API

#### is(val, [ name ])

Registers a new Chain to `is`

* val - The subject of the chain
* name - The name to be used in error messages

returns a new Chain instance

#### is.a is.an

returns `is`

```javascript

is.a.string('abc');
// true

is === is.a.an;
// true

```

#### is.valid

Returns false if any registered Chain has any errors

#### is.testCount

Returns the total number of tests of all registered Chains

#### is.errorCount

Returns the total number of errors of all registered Chains

#### is.errorMessages

Returns an array of error messages from all registered Chains

#### is.clear()

Clears out all registered Chains

returns `is`

#### is.throwErrors()

If `is.valid` is false, throw `is.errorMessages` as an Exception

#### is.configure.addValidator(name, fn, [ options ])

Add a validator to `is` and the Chain prototype

* name - The name the validator may be accessed through
* fn - The validation function. Returns true on valid, false on not valid
* options
  * failMessage - The error message for if the validation fails (default: 'pass ' + name + ' test')

```javascript

is.configure.addValidator('odd', function (val) {
    return val % 2 === 1;
}, { failMessage: 'be odd' });

is.odd(3);
// true

is(2).odd().errorMessage;
// 'value must be odd'

```

#### is.configure.addManipulator(name, fn, [ options ])

Add a manipulator to `is` and the Chain prototype

* name - The name the manipulator may be access through
* fn - The manipulation function. Returns the manipulated value
* options
  * failVal - A value or function to compare to the manipulated value to indicate failure. If not set, the manipulation cannot fail
  * failMessage - The error message for if the manipulation fails (default: 'be able to be manipulated by ' + name)

```javascript

is.configure.addManipulator('toExponent', function (val, exp) {
    return Math.pow(val, exp);
}, { failVal: isNaN, failMessage: 'be a number' });

is.toExponent(5, 2);
// 25

is('abc').toExponent(2).errorMessage;
// 'value must be a number'

```

#### is.METHOD(val, args*)

All validation and manipulation methods are available as properties of is.

```javascript

is.string('abc');
// true

is.lessThan(123, 100);
// false

```

#### Chain(val, [ name ])

#### Chain.a Chain.an Chain.and

returns `this`

#### Chain.not

Negates the next test

returns `this`

```javascript

is('abc').not.a.number().valid;
// true

```

#### Chain.or

Simple `or` condition

If the validation before `.or` or the validation after passes, then the chain is considered valid

```javascript

is(123)
  .a.string().or
    .a.number()
  .valid;
// true

is(123)
  .a.string().or
    .an.array().or
    .a.regExp()
  .errorMessage;
// 'value must be a string, be an array, or be a regular expression'

```

The behavior of `or` may be a little strange, and I am open to suggestions:

* All `or` tests after a valid test will be skipped
* All errors in a set of `or`s count as 1 error in `.errorCount`
* Only the tests that are performed until a valid test count towards `.testCount` (I might set all `or` tests to count as 1)
* There is no grouping of tests (yet - let me know if this is desired). `or` will only work with single tests

#### Chain.value

Returns the manipulated subject of the Chain

#### Chain.valid

Returns true if no errors have occured on the chain

#### Chain.testCount

Returns the number of tests that have occured on the chain

#### Chain.errorCount

Returns the number of errors that have occured on the chain

#### Chain.errorMessage

Returns a composed error message describing all the tests that have failed on the chain

#### Chain.clear();

Clears out all tests on the chain

returns `this`

#### Chain.property(propName, [ name ])

Creates a new Chain with the current chains property `propName` as the subject

* propName - the property to use as the new subject
* name - the name to be used in the error message. (default: `propName`)

```javascript

is('abc')
  .a.string()
  .property('length', 'total number of characters')
    .greaterThan(5)
    .lessThan(10)
    .up()
  .errorMessage;
// 'value must have a total number of characters which must be greater than 5'

```

#### Chain.ifValid()

Starts bypassing validations and manipulations if the chain is not valid

#### Chain.stop()

Starts bypassing validations and manipulations on the chain

#### Chain.resume()

Stops bypassing validations and manipulations on the chain

#### Chain.up()

Returns the parent chain if it exists

```javascript

var chain = is('abc')
  , length = chain.property('length')
;

chain === length;
// false

chain === length.up();
// true

```

#### Chain.throwError()

Throws an exception if the chain is not valid

#### Chain.validate(fn, failMessage)

Run a one time validation in the chain

* fn - The validation function. Returns `true` on success, `false` on failure
* failMessage - The error message if the validation fails

```javascript

is(123)
  .validate(function (val) {
      return val % 2 === 0;
  }, 'be even')
  .errorMessage;
// 'value must be even'

```

#### Chain.manipulate(fn, [ name ])

Run a one time manipulation in the chain

* fn - The manipulation function. Returns the manipulated value
* name - The name of the manipulated value

returns `this`

```javascript

is(123)
  .manipulate(function (val) {
      return val * val;
  }, 'value squared')
    .value;
// 15129

```

#### Chain.errorFormat(format)

Replace the chains error format with `format`

* format - a string to represent how error messages are displayed

The default format is '{0} must {1}' where {0} is the name of the chain subject and {1} is the list of error messages

#### Chain.propFormat(format)

Replace the chain property format with `format`

* format - a string to represent how properties are formatted in error messages

The default format is 'have a {0} which must {1}' where {0} is the name of the property and {1} is the list of error messages for the property

### Error Messages // TODO - revise this

Error messages are customizable and more informative than simply stating 'invalid input'

```javascript

is('$ab', 'Your username')
  .string()
  .match(/^[a-z]*$/i, 'only be alphabetic characters')  // fails
  .property('length')
    .greaterThan(5)  // fails
    .lessThan(15)
;

is.errorMessages;
// ['Your username must only be alphabetic characters and have a length which must be greater than 5']

```


### Built-in Validation

#### string(val)

Is `val` a string object

#### number(val)

Is `val` numeric. NaN, Infinity, true, false, and '' are not numeric

#### strictNumber(val)

Is `val` a number object

#### lessThan(val, limit)

Simple less than comparison: `return val < limit`

#### lessThanEqual(val, limit)

Simple less than or equal comparison: `return val <= limit`

#### greaterThan(val, limit)

Simple greater than comparison: `return val > limit`

#### greaterThanEqual(val, limit)

Simple greater than or equal comparison: `return val > limit`

#### between(val, lower, upper)

Exclusive comparison: `return val > lower && val < upper`

#### within(val, lower, upper)

Inclusive comparison: `return val >= lower && val <= upper`

#### equal(val, expected)

Uses [deep-is](https://github.com/thlorenz/deep-is) to compare objects

#### strictEqual(val, expected)

Simple strict equality comparison: `return val === expected`

#### strictBoolean(val)

`val` must equal true or false

#### date(val)

Can `val` be parsed into a date

#### strictDate(val)

Is `val` a Date object

#### object(val)

Is `val` an object

#### literalObject(val)

Check if `val` is an object literal

`{}`           - true
`new Object()` - true
`[]`           - false
`new Date()`   - false

#### inside(val, arr)

Check for the existance of `val` in an array or string

#### haveProperty(val, propName)

Does `val` have a property `propName`

#### haveOwnProperty(val, propName)

Does `val` have its own property `propNam`

#### match(val, regExp)

Compares `val` to a regular expression

#### function(val)

Is `val` a function

#### args(val)

Is `val` an arguments object

#### regExp(val)

Is `val` a regular expression

#### instanceOf(val, constructor)

Is `val` an instance of constructor

#### array(val)

Is `val` an array

#### buffer(val)

Is `val` a Buffer object

#### empty(val)

Is `val` empty

* array, arguments, and string - true if val.length === 0
* null, undefined - true
* object - true if it has no properties of its own



### Built-in Manipulation

#### toString(val)

Returns a string representation of `val`

* undefined and null - returns an empty string ('')
* object literal - returns JSON.stringify(val)
* everything else - returns String(val)

Cannot fail

#### trim(val, [ chars ])

Trims characters from both side of `val`. It will convert `val` to a string using `is.toString`

* chars - the characters to trim from the sides (default: '\\r\\n\\t\\s' - whitespace characters)

Cannot fail

#### leftTrim(val, [ chars ])

Trims characters from the left side of `val`. It will convert `val` to a string using `is.toString`

* chars - the characters to trim from the left side (default: '\\r\\n\\t\\s' - whitespace characters)

Cannot fail

#### rightTrim(val, [ chars ])

Trims characters from the right side of `val`. It will convert `val` to a string using `is.toString`

* chars - the characters to trim from the right side (default: '\\r\\n\\t\\s' - whitespace characters)

Cannot fail

#### toNumber(val)

Parse `val` into a number

An empty string ('') returns NaN. Everything else is parsed by `Number(val)`

* failVal - isNaN
* failMessage - 'be a number'

#### toInteger(val, [ radix ])

Use parseInt to parse `val`

* radix - the radix to use in parseInt (default: 10)

* failVal - isNaN
* failMessage - 'be an integer'

#### toFloat(val)

Use parseFloat to parse `val`

* failVal - isNaN
* failMessage - 'be a floating point number'

#### toBoolean(val)

Converts `val` into true or false

'', '0', 'false', and falsy objects will be converted to false.  Everything else will be true.

Cannot fail

#### toDate(val)

Converts `val` into a Date object

null, undefined, and boolean values return NaN

* failVal - isNaN
* failMessage - 'be a valid date'

#### toRegExp(val)

Converts `val` into a regular expression

It will convert RegExp.toString() back into a RegExp. All other strings will not have flags

```javascript

var reg = /^hello$/gi
  , str = reg.toString() // '/^hello$/gi'
;

is.toRegExp(str);
// /^hello$/gi

is.toRegExp('^helloE');
// /^hello$/

```

* failVal - null
* failMessage - 'be a regular expression'

#### default(val, newVal, compare)

Replaces `val` with `newVal` if it equals `compare`

`compare` may also be a function which returns true to replace the values

```javascript

is.default('abc', 'def', 'abc');
// 'def'

is.default(123, 0, isNaN);
// 123

is.default(undefined, '') // `compare` is undefined. Its value is `undefined`
// ''

is('abc')
  .toNumber()        // converts 'abc' to NaN
  .default(0, isNaN) // replaces NaN with 0
  .clear()           // clear out errors from `toNumber()`
  .value;              // return the value
// 0

```

Cannot fail