'use strict';

var testCase = require('nodeunit').testCase
	, is = require('../lib/is');

var tests = {
  num: {
    pass: [[123], [456.789], [-12], [13e5], [-13e-6], ['12'], ['-123.456'], ['2.54e3']],
    fail: [[NaN], [Infinity], ['hello'], [true], [false], [[]], [{}], ['']]
  },
  lt: {
    pass: [[0, 1], [100, 200], ['a', 'b']],
    fail: [[1, 0], [1, 1], [200, 100], ['b', 'a']]
  },
  gt: {
    pass: [[1, 0], [200, 100], ['b', 'a']],
    fail: [[0, 1], [100, 200], [1, 1], ['a', 'b']]
  },
  lte: {
    pass: [[0, 1], [1, 1], [100, 200], ['a', 'b'], ['a', 'a']],
    fail: [[2, 1], [200, 100], ['b', 'a']]
  },
  gte: {
    pass: [[1, 0], [1, 1], [200, 100], ['b', 'a'], ['a', 'a']],
    fail: [[1, 2], [100, 200], ['a', 'b']]
  },
  email: {
		pass: [['niceandsimple@example.com'], ['very.common@example.com'], ['a.little.lengthy.but.fine@dept.example.com'], ['disposable.style.email.with+symbol@example.com'], /*['user@[IPv6:2001:db8:1ff::a0b:dbd0]'],*/ ['"much.more unusual"@example.com'], ['"very.unusual.@.unusual.com"@example.com'], ['"very.(),:;<>[]\\".VERY.\\"very@\\ \\"very\\".unusual"@strange.example.com'], ['!#$%&\'*+-/=?^_`{}|~@example.org'], ['"()<>[]:,;@\\\"!#$%&\'*+-/=?^_`{}| ~.a"@example.org'], ['" "@example.org'], ['ipdomain@64.233.161.83']], // Does not support IPv6 domain
		fail: [['not an email'], ['Abc.example.com'], ['A@b@c@example.com'], ['a"b(c)d,e:f;g<h>i[j\\k]l@example.com'], ['just"not"right@example.com'], ['this is"not\\allowed@example.com'], ['this\\ still\\"not\\\\allowed@example.com']]
  },
  url: {
    pass: [['http://www.google.com']],
    fail: [['not a url'], ['http://notopleveldomain/with/a/path.jpg'], ['https://address.com/badchars/<>@']]
  },
	match: {
		pass: [],
		fail: []
	},
	eq: {
		pass: [['abc', 'abc'], ['123', 123], [true, 1], [false, 0]],
		fail: [['abc', 'def'], [123, '456'], [true, 0], [false, 1]]
	},
	sEq: {
		pass: [],
		fail: []
	},
	ip: {
		pass: [['172.16.254.1'], ['0.0.0.0'], ['255.255.255.255']],
		fail: [['172.16.254.256'], [''], ['abc'], [true], [false], ['300.300.300.300']]
	},
	alpha: {
		pass: [['abcdefghijklmnopqrstuvwxyz'], ['aBcDeF'], ['helloworld']],
		fail: [[''], ['abc123'], ['hello world']]
	},
	alphaNumeric: {
		pass: [['abcdefghijklmnopqrstuvwxyz0123456789'], ['aBcDeF0123'], ['helloworld2']],
		fail: [[''], ['abc123!'], ['hello world'], ['!@#%$^&*']]
	},
	date: {
		pass: [['Aug 9, 1995'], ['Wed, 09 Aug 1995 00:00:00 GMT'], ['Thu, 01 Jan 1970 00:00:00 GMT-0400'], ['1994-11-05T08:15:30-05:00'], ['1994-11-05T13:15:30Z'], ['1995-09-09'], ['1995-9-9'], ['1995/09/09 10:10:10']],
		fail: [[1336802400000], ['Aug 32, 1995'], ['notadate']]
	},
	lObj: {
		pass: [[{}], [new Object()], [{ hello: 'world' }]],
		fail: [['abc'], [123], [true], [false], [undefined], [null], [[1,2,3]], [/^reg$/]]
	},
	str: {
		pass: [['abc'], ['123'], ['']],
		fail: [[123], [true], [{}], [[]], [null], [undefined]]
	},
	sNum: {
		pass: [[0], [123], [1.23e15], [-123.01]],
		fail: [[''], ['123'], ['abc'], [true], [false], [[]], [{}], [null], [undefined]]
	},
	fn: {
		pass: [[function () {}], [Math.max]],
		fail: [[''], ['abc'], [123], [true], [{}], [[]], [null], [undefined]]
	},
	sDate: {
		pass: [[new Date()], [new Date(2013, 2, 12)]],
		fail: [[''], ['abc'], ['2013-03-12'], [123], [true], [{}], [[]], [null], [undefined]]
	},
	regExp: {
		pass: [[/^reg$/], [new RegExp('^reg$', 'g')]],
		fail: [[''], ['^reg$'], [123], [true], [{}], [[]], [null], [undefined]]
	},
	sBool: {
		pass: [[true], [false]],
		fail: [[''], [0], [1], ['true'], ['false'], [{}], [[]], [null], [undefined]]
	},
	inside: {
		pass: [['a', 'abc'], ['values', ['an', 'array', 'of', 'values']]],
		fail: [['d', 'abc'], ['object', ['an', 'array', 'of', 'values']]]
	},
	has: {
		pass: [['abc', 'length'], [{ hello: 'world' }, 'hello']],
		fail: [['abc', 'height'], [{ hello: 'world' }, 'length']]
	}
};

tests.notMatch = {
	pass: tests.match.fail,
	fail: tests.match.pass
};

var manipulations = {
	toStr: [[true, 'true'], [false, 'false'], [123, '123'], ['abc', 'abc'], [undefined, ''], [null, '']],
	toInt: [[123, 123], ['123', 123], [12.3, 12], ['12.3', 12]], // TODO add tests for NaN
	toDecimal: [[12.3, 12.3], ['12.3', 12.3]], // TODO add tests for NaN
	toDate: [], // TODO add tests to check output (cannot check equality of two objects)
	toNum: [[123, 123], ['123', 123], ['12.3', 12.3]], // TODO add tests for NaN
	trim: [['  abc  ', 'abc']],
	ltrim: [['  abc  ', 'abc  ']],
	rtrim: [['  abc  ', '  abc']],
	toBool: [['true', true], ['TRUE', true], ['false', false], [1, true], [0, false], ['abc', true], ['', false]]
};

exports.initializedCorrectly = function (unit) {
  
  unit.ok(is.valid(), "is valid");
  unit.equal(is.errCount(), 0, "has no failures");

  unit.done();

};

exports.staticTests = function (unit) {
	var test;
  for (test in tests) {
    if (tests.hasOwnProperty(test)) {
      
      tests[test].pass.forEach(function (args) {
        unit.ok(is[test].apply(null, args), test + ' failed against ' + JSON.stringify(args));
      });

      tests[test].fail.forEach(function (args) {
        unit.ok(!is[test].apply(null, args), test + ' passed against ' + JSON.stringify(args));
      });

    }
  }
  unit.done();
};

exports.staticManipulations = function (unit) {
	var method;
	for (method in manipulations) {
		if (manipulations.hasOwnProperty(method)) {
			
			manipulations[method].forEach(function (args) {
				unit.equal(is[method].call(null, args[0]), args[1]);
			});

		}
	}
	unit.done();
};

exports.validChains = function (unit) {

  is.clear();

  is.that('example@domain.com', 'Email')
    .email();

  is.that(20, 'Twenty')
    .num()
    .gt(10)
    .lt(30);

  unit.ok(is.valid());

  unit.done();

};

exports.invalidChains = function (unit) {
  
  is.clear();

  is.that('invalid email address', 'Email')
    .email();

  unit.ok(!is.valid());

  unit.equal(is.errCount(), 1);

  is.that(20, 'Twenty')
    .num()
    .gt(30)
    .lt(10);

  unit.equal(is.errCount(), 3);
	unit.equal(is.errorMessages().length, 2);

  unit.done();

};

exports.instanceTest = function (unit) {
  
  is.clear();

  var isInst = is.create();

  unit.notStrictEqual(is, isInst);

  isInst.that(10, 'Number')
    .gt(20);

  unit.equal(isInst.errCount(), 1);

  unit.notEqual(is.errCount(), isInst.errCount());

  unit.done();

};

exports.countsTest = function (unit) {

	is.clear();

	unit.equal(is.errCount(), 0);
	unit.equal(is.testCount(), 0);

	var c1 = is.that(100)
		.num()
		.gt(200)
	
		, c2 = is.that(400)
		.num()
		.gt(200);
	
	unit.equal(c1.errCount(), 1);
	unit.equal(c1.testCount(), 2);

	unit.equal(c2.errCount(), 0);
	unit.equal(c2.testCount(), 2);

	unit.equal(is.errCount(), 1);
	unit.equal(is.testCount(), 4);

	unit.done();

};

exports.intCoercion = function (unit) {
	
	is.clear();
	
	var i1 = is.that('123', 'Valid int')
		.toInt()
		.num();
	
	unit.ok(i1.valid());
	unit.equal(i1.val(), 123);
	
	var i2 = is.that('abc', 'Invalid int')
		.toInt()
		.num();
	
	unit.ok(!i2.valid());
	unit.isNaN(i2.val()); // Add high level methods to assert
	
	unit.done();
	
};

exports.properties = function (unit) {
	
	is.clear();
	
	var c1 = is.that('abc');
	var c2 = c1.prop('length');
	
	unit.equal(c1.val(), 'abc');
	unit.equal(c2.val(), 3);
	
	unit.done();
	
};

exports.manipulation = function (unit) {
	
	is.clear();
	
	var m1 = is.that(2, 'Two')
		.eq(2)
		.manip(function (val) {
			return val * 2;
		}, 'Two times two')
			.eq(4);
	
	unit.ok(m1.valid());
	unit.equal(m1.val(), 4);
	unit.equal(m1.up().val(), 2);
	
	unit.done();
	
};

exports.throwing = function (unit) {

	is.clear();

	var c1 = is.that('abc', 'Invalid number');

	unit.throws(function () {
		c1.num().throwErr();
	});

	unit.ok(c1.valid());
	unit.ok(is.valid());

	var c2 = is.that('123', 'Valid number');
	
	unit.throws(function () {
		c2.toInt().gt(300);
		is.throwErrs();
	});

	unit.ok(!c2.valid());
	unit.ok(is.valid());

	c2.clear();

	unit.doesNotThrow(function () {
		c2.toInt().gt(0);
		c2.throwErr();
	});

	unit.done();

};

exports.negate = function (unit) {

	is.clear();

	is.that('abc').not().num().str();

	unit.ok(is.valid());

	is.that(123).not().num();

	unit.ok(!is.valid());

	unit.done();

};

exports.replace = function (unit) {

	is.clear();

	var c1 = is.that() // Using undefined as val
		.replace('abc'); // Replace undefined with 'abc'
	
	unit.equal(c1.val(), 'abc');

	var c2 = is.that('abc')
		.replace('def');
	
	unit.equal(c2.val(), 'abc');

	var c3 = is.that('abc')
		.replace('def', 'abc');
	
	unit.equal(c3.val(), 'def');

	unit.done();

};

exports.singleUseTests = function (unit) {

	is.clear();

	var c1 = is.that(2)
		.test(function (val) { // Even test
			return val % 2 === 0;
		}, 'be even');
	
	unit.ok(c1.valid());

	var c2 = is.that(2)
		.test(function (val) {
			return val % 2 === 1;
		}, 'be odd');
	
	unit.ok(!c2.valid());

	unit.done();

};

exports.stopIfErr = function (unit) {
	
	is.clear();

	var c1 = is.that(123);
	
	c1
		.num()
		.stopIfErrs();
	
	unit.ok(c1.valid());

	c1
		.lt(10)
		.stopIfErrs();
	
	unit.equal(c1.errCount(), 1);

	c1
		.gt(200);
	
	unit.equal(c1.errCount(), 1);

	unit.done();

};

module.exports = testCase(exports);
