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

