'use strict';

var emailReg = /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/
  , urlReg = /^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?(localhost|(?:(?:[\-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[\-\w~!$+|.,="'\(\)_\*:]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[\-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[\-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[\-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[\-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[\-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i;


exports.str = function (val) {
  if (!(typeof(val) === 'string' || val instanceof String)) {
    return 'a string';
  }
};

exports.num = function (val) {
  if (!(typeof(val) === 'number' || val instanceof Number)) {
    return 'a number';
  }
};

exports.lt = function (val, limit) {
  if (!(val < limit)) {
    return 'less than ' + limit;
  }
};

exports.gt = function (val, limit) {
  if (!(val > limit)) {
    return 'greater than ' + limit;
  }
};

exports.lte = function (val, limit) {
  if (!(val <= limit)) {
    return 'less than or equal to ' + limit;
  }
};

exports.gte = function (val, limit) {
  if (!(val >= limit)) {
    return 'greater than or equal to ' + limit;
  }
};

exports.email = function (val) {
  if (!(emailReg.test(val))) {
    return 'a valid email address';
  }
};

exports.url = function (val) {
  if (!(urlReg.test(val))) {
    return 'a valid url address';
  }
};
