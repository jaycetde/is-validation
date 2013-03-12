**Library for chaining validation and manipulation together**

## Examples

```javascript

var is = require('is');

// basic usage
is.num(123);										// true
is.gt(123, 100);								// false

// simple chaining
is.that(123)
	.num()
	.gt(100);

is.valid();											// false
is.errCount();									// 1
is.testCount();									// 2

// complex chaining
var chain = is.that("hello world");
chain
	.sStr()
	.prop('length')
		.gt(10)
		.lt(20)
		.up()
	.match(/^[a-z ]+$/i);
	
chain.valid();	// true
is.valid();			// false (still false from simple chaining example)

chain.errCount();	// 0
is.errCount();	// 1

chain.testCount();	// 4
is.testCount();	// 6

is.clear();

```

This library is not yet on [npm](http://github.com/isaacs/npm)

More documentation will be available soon. In the meantime, look through the source code
and test file
