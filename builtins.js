'use strict';

var helpers = require('./helpers');

var emailReg = /^([a-zA-Z0-9!#$%&'*+\/=?\^_`{|}~\-]+|"([a-zA-Z0-9()<>\[\]:,;@\\!#$%&'*+\/=?\^_`{|}~.\- ]|\\")+")(?:\.([a-zA-Z0-9!#$%&'*+\/=?\^_`{|}~\-]+|"([a-zA-Z0-9()<>\[\]:,;@\\!#$%&'*+\/=?\^_`{|}~.\- ]|\\")+"))*@(?:[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?$/ // /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/ // TODO use a better email regular expression
  , urlReg = /^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?(localhost|(?:(?:[\-\w\d{1-3}]+\.)+(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2}))|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[\-\w~!$+|.,="'\(\)_\*:]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[\-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[\-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[\-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[\-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[\-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/i
	, ipReg = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
	, alphaReg = /^[a-z]+$/i
	, alphaNumericReg = /^[a-z0-9]+$/i
	, regWhitespace = '\\r\\n\\t\\s'
	, objProto = Object.prototype
;

var validators = exports.validators = {
	
	num: function (val, msg) {
		if (val === true || val === false || exports.manipulators.trim(val) === "" || isNaN(Number(val))) {
			return msg || 'be numeric';
		}
	},

	lt: function (val, limit, msg) {
		if (!(val < limit)) {
			return msg ? helpers.formatStr(msg, limit) : helpers.formatStr('be less than {}', limit);
		}
	},

	gt: function (val, limit, msg) {
		if (!(val > limit)) {
			return msg ? helpers.formatStr(msg, limit) : helpers.formatStr('be greater than {}', limit);
		}
	},

	bt: function (val, lower, upper, msg) {
		if (!(val > lower && val < upper)) {
			return msg ? helpers.formatStr(msg, lower, upper) : helpers.formatStr('be between {} and {}', lower, upper);
		}
	},

	lte: function (val, limit, msg) {
		if (!(val <= limit)) {
			return msg ? helpers.formatStr(msg, limit) : helpers.formatStr('be less than or equal to {}', limit);
		}
	},

	gte: function (val, limit, msg) {
		if (!(val >= limit)) {
			return msg ? helpers.formatStr(msg, limit) : helpers.formatStr('be greater than or equal to ', limit);
		}
	},

	email: function (val, msg) {
		if (!emailReg.test(val)) {
			return msg || 'be a valid email address';
		}
	},

	url: function (val, msg) {
		if (!urlReg.test(val)) {
			return msg || 'be a valid url address';
		}
	},

	match: function (val, reg, msg) { // TODO add ability to use string regex with modifier
		if (!reg.test(val)) {
			return msg || 'match an expression';
		}
	},

	notMatch: function (val, reg, msg) { // TODO add ability to use string regex with modifier
		if (reg.test(val)) {
			return msg || 'not match an expression';
		}
	},

	eq: function (vala, valb, msg) {
		if (vala != valb) {
			return msg ? helpers.formatStr(msg, valb) : helpers.formatStr('equal {}', valb);
		}
	},

	ip: function (val, msg) {
		if (!ipReg.test(val)) {
			return msg || 'be a valid ip address';
		}
	},

	alpha: function (val, msg) {
		if (!alphaReg.test(val)) {
			return msg || 'only be alphabetic characters';
		}
	},

	alphaNumeric: function (val, msg) {
		if (!alphaNumericReg.test(val)) {
			return msg || 'only be alphanumeric characters';
		}
	},

	date: function (val, msg) {
		if (isNaN(Date.parse(val))) {
			return msg || 'be a valid date';
		}
	}

};

var strictFn = function (name, typeStr, defaultMessage) {
	varlidators[name] = function (val, msg) {
		if (objProto.toString.call(val) === '[object ' + typeStr + ']') {
			return msg || defaultMessage;
		}
	};
};

var strictTests = [
	['sStr', 'String', 'be a string'],
	['sNum', 'Number', 'be a number']
];

for (var i = 0; i < strictTests.length; i += 1) {
	strictFn.apply(null, strictTests[i]);
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
		return String(val);
	}

};

manipulators.toDecimal = function (val) {
	return parseFloat(val);
};
manipulators.toDecimal.failVal = isNaN;
manipulators.toDecimal.failMessage = 'be a decimal';
manipulators.toInt = function (val, radix) {
	radix = radix || 10;
	return parseInt(val, radix);
};
manipulators.toInt.failVal = isNaN;
manipulators.toInt.failMessage = 'be an integer';

manipulators.toNum = function (val) {
	if (manipulators.trim(val) === '') {
		return NaN;
	}
	return Number(val);
};
manipulators.toNum.failVal = isNaN;
manipulators.toNum.failMessage = 'be a number';

manipulators.toDate = function (val) {
	return Date.parse(val);
};
manipulators.toDate.failVal = isNaN;
manipulators.toDate.failMessage = 'be a valid date';
