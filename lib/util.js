exports.formatStr = function () {
  var args = Array.prototype.slice.call(arguments)
    , str = args.shift()
    , i = 0
  ;
  return str.replace(/\{([0-9]*)\}/g, function (m, argI) {
		argI = argI || i;
		i += 1;
    return String(args[argI]);
  });
};

exports.stringListJoin = function (arr, joinStr) {

    joinStr = joinStr || 'and';
    
	if (arr.length === 1) {
		return arr[0];
	}

	if (arr.length === 2) {
		return arr.join(' ' + joinStr + ' ');
	}

	if (arr.length >= 3) {
		return arr.slice(0, arr.length - 1).join(', ') + ', ' + joinStr + ' ' + arr[arr.length - 1];
	}

};

exports.existsOn = function (obj, propName) {
    if (Object.getOwnPropertyDescriptor(obj, propName)) return true;
    return false;
};