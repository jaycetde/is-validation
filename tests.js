'use strict';

var is = require('./is');

var tests = {
  str: {
    pass: [['hello'], ['world']],
    fail: [[123], [true], [false]]
  },
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
    pass: [],
    fail: []
  }
};

exports.static = function (unit) {
  for (var test in tests) {
    if (tests.hasOwnProperty(test)) {
      
      tests[test].pass.forEach(function (args) {
        unit.ok(is[test].apply(null, args));
      });

      tests[test].fail.forEach(function (args) {
        unit.ok(!is[test].apply(null, args));
      });

    }
  }
  unit.done();
};

exports.validChains = function (unit) {

  is.clear();

  is.that('example@domain.com', 'Email')
    .str()
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
    .str()
    .email();

  unit.ok(!is.valid());

  unit.equal(is.failures(), 1);

  is.that(20, 'Twenty')
    .num()
    .gt(30)
    .lt(10);

  unit.equal(is.failures(), 3);

};
