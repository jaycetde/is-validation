'use strict';

exports.formatStr = function () {
  var args = Array.prototype.slice.call(arguments)
    , str = args.shift()
    , i = 0;
  return str.replace(/\{([0-9]*)\}/g, function (m, argI) {
		argI = argI || i;
		i += 1;
    return typeof(args[argI]) !== 'undefined' ? args[argI] : '';
  });
};

exports.stringListJoin = function (arr) {

	if (arr.length === 1) {
		return arr[0];
	}

	if (arr.length === 2) {
		return arr.join(' and ');
	}

	if (arr.length >= 3) {
		return arr.slice(0, arr.length - 1).join(', ') + ', and ' + arr[arr.length - 1];
	}

};

exports.cloneObj = function (obj) {

	if (Object(obj) === obj) {
		var prop, clone = obj instanceof RegExp ? new RegExp(obj) : new obj.constructor();
		for (prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				clone[prop] = obj[prop];
			}
		}
		return clone;
	}

	return obj;	// Object must be basic type (String, Number, Boolean, Undefined or Null)

};
