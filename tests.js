'use strict';

var is = require('./is');

var tests = {
  num: {
    pass: [[123], [456.789], [-12], [13e5], [-13e-6]],
    fail: [['hello'], [true], [false], ['12'], [[]], [{}], ['']]
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
    pass: [],
    fail: []
  },
  gte: {
    pass: [],
    fail: []
  },
  email: {
    pass: [],
    fail: []
  },
  url: {
    pass: [['http://www.google.com']],
    fail: [['not a url'], ['http://notopleveldomain/with/a/path.jpg'], ['https://address.com/badchars/<>@']]
  }
};

exports.initializedCorrectly = function (unit) {
  
  unit.ok(is.valid(), "is valid");
  unit.equal(is.failures(), 0, "has no failures");

  unit.done();

};

exports.static = function (unit) {
  for (var test in tests) {
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

  unit.equal(is.failures(), 1);

  is.that(20, 'Twenty')
    .num()
    .gt(30)
    .lt(10);

  unit.equal(is.failures(), 3);

  unit.done();

};

exports.instanceTest = function (unit) {
  
  is.clear();

  var isInst = is.create();

  unit.notStrictEqual(is, isInst);

  isInst.that(10, 'Number')
    .gt(20);

  unit.equal(isInst.failures(), 1);

  unit.notEqual(is.failures(), isInst.failures());

  unit.done();

};


