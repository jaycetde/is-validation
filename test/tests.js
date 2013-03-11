'use strict';

var testCase = require('nodeunit').testCase
	, is = require('../is');

var tests = {
  numeric: {
    pass: [[123], [456.789], [-12], [13e5], [-13e-6], ['12'], ['-123.456'], ['2.54e3']],
    fail: [['hello'], [true], [false], [[]], [{}], ['']]
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
	}
};

tests.notMatch = {
	pass: tests.match.fail,
	fail: tests.match.pass
};

exports.initializedCorrectly = function (unit) {
  
  unit.ok(is.valid(), "is valid");
  unit.equal(is.errCount(), 0, "has no failures");

  unit.done();

};

exports.staticMethods = function (unit) {
	var test;
  for (test in tests) {
    if (tests.hasOwnProperty(test)) {
      
      tests[test].pass.forEach(function (args) {
        unit.ok(is[test].apply(null, args), test + ' tested against ' + JSON.stringify(args));
      });

      tests[test].fail.forEach(function (args) {
        unit.ok(!is[test].apply(null, args), test + ' tested against ' + JSON.stringify(args));
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

module.exports = testCase(exports);
