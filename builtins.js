'use strict';

var helpers = require('./helpers');

var emailReg = /^([a-zA-Z0-9!#$%&'*+\/=?\^_`{|}~\-]+|"([a-zA-Z0-9()<>\[\]:,;@\\!#$%&'*+\/=?\^_`{|}~.\- ]|\\")+")(?:\.([a-zA-Z0-9!#$%&'*+\/=?\^_`{|}~\-]+|"([a-zA-Z0-9()<>\[\]:,;@\\!#$%&'*+\/=?\^_`{|}~.\- ]|\\")+"))*@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?$/ // /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/ // TODO use a better email regular expression
  , urlReg = /^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?(localhost|(?:(?:[\-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[\-\w~!$+|.,="'\(\)_\*:]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[\-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[\-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[\-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[\-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[\-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i
	, ipReg = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
	, alphaReg = /^[a-z]+$/i
	, alphaNumericReg = /^[a-z0-9]+$/i
	, regWhitespace = '\\r\\n\\t\\s'
;

var validators = exports.validators = {};

var num, lt, gt, lte, gte, bt, date, lObj, match, eq, sEq, sBool, inside, has;

var toInt, toDecimal, toDate, toNum;

var strictFn = function (typeStr, defaultMessage) {
	var fn = function (val) {
		return Object.prototype.toString.call(val) === '[object ' + typeStr + ']';
	};
	fn.failMessage = defaultMessage;
	return fn;
};

var regExpFn = function (reg, defaultMessage) {
	var fn = function (val) {
		return reg.test(val);
	};
	fn.failMessage = defaultMessage;
	return fn;
};

var strictTests = {
	'str': ['String', 'be a string'],
	'sNum': ['Number', 'be a number'],
	'fn': ['Function', 'be a function'],
	'args': ['Arguments', 'be arguments'],
	'sDate': ['Date', 'be a date'],
	'regExp': ['RegExp', 'be a regular expression']
};

var regExpTests = {
	'email': [emailReg, 'be a valid email address'],
	'url': [urlReg, 'be a valid url address'],
	'ip': [ipReg, 'be a valid IP address'],
	'alpha': [alphaReg, 'only be alphabetic characters'],
	'alphaNumeric': [alphaNumericReg, 'only be alphanumeric characters']
};

num = validators.num = function (val) {
	return val !== true && val !== false && exports.manipulators.trim(val) !== '' && isFinite(val) && !isNaN(Number(val));
};
num.failMessage = 'be numeric';

lt = validators.lt = function (val, limit) {
	return val < limit;
};
lt.failMessage = 'be less than {1}';

gt = validators.gt = function (val, limit) {
	return val > limit;
};
gt.failMessage = 'be greater than {1}';

bt = validators.bt = function (val, lower, upper) {
	return val > lower && val < upper;
};
bt.failMessage = 'be between {1} and {2}';

lte = validators.lte = function (val, limit) {
	return val <= limit;
};
lte.failMessage = 'be less than or equal to {1}';

gte = validators.gte = function (val, limit) {
	return val >= limit;
};
gte.failMessage = 'be greater than or equal to {1}';

match = validators.match = function (val, reg) {
	return reg.test(val);
};
match.failMessage = 'match an expression';

eq = validators.eq = function (vala, valb) {
	return vala == valb;
};
eq.failMessage = 'equal {1}';

sEq = validators.sEq = function (vala, valb) {
	return vala === valb;
};
sEq.failMessage = 'equal {1}';

date = validators.date = function (val) {
	return !isNaN(Date.parse(val));
};
date.failMessage = 'be a valid date';

lObj = validators.lObj = function (val) {
	return val && val.constructor === Object;
};
lObj.failMessage = 'be an object literal';

sBool = validators.sBool = function (val) {
	return val === true || val === false;
};
sBool.failMessage = 'equal true or false';

inside = validators.inside = function (val, arr) {
	return arr.indexOf(val) !== -1;
};
inside.failMessage = 'be inside an array';

has = validators.has = function (val, propName) {
	return typeof(val[propName]) !== 'undefined';
};
has.failMessage = "have a '{1}' property";

var prop;

for (prop in strictTests) {
	if (strictTests.hasOwnProperty(prop)) {
		validators[prop] = strictFn.apply(null, strictTests[prop]);
	}
}

for (prop in regExpTests) {
	if (regExpTests.hasOwnProperty(prop)) {
		validators[prop] = regExpFn.apply(null, regExpTests[prop]);
	}
}

var manipulators = exports.manipulators = {
	trim: function (str, chars) {
		chars = chars || regWhitespace;
		return String(str).replace(new RegExp('^['+chars+']+|['+chars+']+$', 'g'), '');
	},

	ltrim: function (str, chars) {
		chars = chars || regWhitespace;
		return String(str).replace(new RegExp('^['+chars+']+', 'g'), '');
	},

	rtrim: function (str, chars) {
		chars = chars || regWhitespace;
		return String(str).replace(new RegExp('['+chars+']+$', 'g'), '');
	},

	toBool: function (val) {
		if (!val || val === '0' || val === 'false' || val === '') {
			return false;
		}
		return true;
	},

	toStr: function (val) {
		return (val === undefined || val === null) ? '' : String(val);
	}

};

toDecimal = manipulators.toDecimal = function (val) {
	return parseFloat(val);
};
toDecimal.failVal = isNaN;
toDecimal.failMessage = 'be a decimal';

toInt = manipulators.toInt = function (val, radix) {
	radix = radix || 10;
	return parseInt(val, radix);
};
toInt.failVal = isNaN;
toInt.failMessage = 'be an integer';

toNum = manipulators.toNum = function (val) {
	if (manipulators.trim(val) === '') {
		return NaN;
	}
	return Number(val);
};
toNum.failVal = isNaN;
toNum.failMessage = 'be a number';

toDate = manipulators.toDate = function (val) {
	return Date.parse(val);
};
toDate.failVal = isNaN;
toDate.failMessage = 'be a valid date';
