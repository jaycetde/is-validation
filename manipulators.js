'use strict';

var regWhitespace = '\\r\\n\\t\\s';

var trim = function (str, chars) {
  chars = chars || regWhitespace;
  return String(str).replace(new RegExp('^['+chars+']+|['+chars+']+$', 'g'), '');
};

var ltrim = function (str, chars) {
  chars = chars || regWhitespace;
  return String(str).replace(new RegExp('^['+chars+']+', 'g'), '');
};

var rtrim = function (str, chars) {
  chars = chars || regWhitespace;
  return String(str).replace(new RegExp('['+chars+']+$', 'g'), '');
};

var toDecimal = function (val) {
  return parseFloat(val);
};
toDecimal.failVal = NaN;
toDecimal.failMessage = 'be a decimal';

var toInt = function (val, radix) {
  radix = radix || 10;
  return parseInt(val, radix);
};
toInt.failVal = NaN;
toInt.failMessage = 'be an integer';

var toNum = function (val) {
  if (trim(val) === '') {
    return NaN;
  }
  return Number(val);
};
toNum.failVal = NaN;
toNum.failMessage = 'be a number';

var toBool = function (val) {
  if (!val || val === '0' || val === 'false' || val === '') {
    return false;
  }
  return true;
};

var toStr = function (val) {
  return String(val);
};

exports.trim = trim;
exports.ltrim = ltrim;
exports.rtrim = rtrim;
exports.toDecimal = toDecimal;
exports.toInt = toInt;
exports.toNum = toNum;
exports.toBool = toBool;
exports.toStr = toStr;
