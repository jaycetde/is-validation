'use strict';

var validators = require('./validators')
  , manipulators = require('./manipulators');

var formatStr = function () {
  var args = Array.prototype.slice.call(arguments)
    , str = args.shift()
    , i = 0;
  return str.replace(/\{([0-9]*)\}/g, function (m, argI) {
		argI = argI || i;
		i += 1;
    return typeof(args[argI]) !== 'undefined' ? args[argI] : '';
  });
};

var stringListJoin = function (arr) {

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

var Is = function () {
  this.clear();
};

var Chain = function (val, name) {
  
  this._val = val;
  this._name = name;
  this._registered = [];
  
  this.clear();

  return this;

};

Chain.prototype.errorFormat = "{0} must {1}";
Chain.prototype.propFormat = "have a {0} which must {1}";
Chain.prototype.prop = function (prop, name) {
  var p = new Chain(this._val[prop], name || prop);
  p._up = this;
  this._registered.push(p);
  if (typeof(this._val[prop]) === "undefined") {
    p._bypass = true;
  }
  return p;
};
Chain.prototype.up = function () {
  return this._up;
};
Chain.prototype.val = function () {
  return this._val;
};
Chain.prototype.success = function () {
  return this._errors.length === 0;
};
Chain.prototype.clear = function () {
  this._errors = [];
  return this;
};
Chain.prototype.addError = function (msg) {
  this._errors.push(msg);
  return this;
};
Chain.prototype.errorList = function () {
	var i, errs = this._errors.slice(0);
	for (i = 0; i < this._registered.length; i += 1) {
		errs.push(formatStr(this.propFormat, this._registered[i]._name, this._registered[i].errorList()));
	}
	return stringListJoin(errs);
};
Chain.prototype.errorMessage = function () {
	var list = this.errorList();
	return formatStr(this.errorFormat, this._name, list);
};

Is.prototype.that = function (val, name) {
  
  if (!(this instanceof Is)) {
    throw new Error('Not an instance');
  }

  var c = new Chain(val, name);
  c._parent = this;

  return c;

};
Is.prototype.addTest = function (name, fn) {
  Is.prototype[name] = function () {
    if (typeof(fn.apply(null, arguments)) === "string") {
      return false;
    }
    return true;
  };
  Chain.prototype[name] = function () {
    if (this._bypass) {
      return this;
    }
    var args = Array.prototype.slice.call(arguments)
      , response = fn.apply(null, [this._val].concat(args));
    if (typeof(response) === "string") {
      this._errors.push(response);
      if (this._parent) {
        this._parent.addError(this._name, response);
      }
    }
    return this;
  };
};
Is.prototype.addCast = function (name, fn) {
  Is.prototype[name] = fn;
  Chain.prototype[name] = function () {
    var args = Array.prototype.slice.call(arguments)
      , val = fn.apply(null, [this._val].concat(args));
    if (typeof(fn.failVal) !== "undefined" && val === fn.failVal) {
      this._bypass = true;
      this.addError(fn.failMessage || "Generic error message");
    }
    this._val = val;
    return this;
  };
};
Is.prototype.addError = function (name, message) {
  if (!this._errors[name]) {
    this._errors[name] = [];
  }
  if (this._errors[name].indexOf(message) === -1) {
    this._failures += 1;
    this._errors[name].push(message);
  }
};
Is.prototype.errors = function () {
  return this._errors;
};
Is.prototype.failures = function () {
  return this._failures;
};
Is.prototype.clear = function () {
  this._errors = {};
  this._failures = 0;
  return this;
};
Is.prototype.valid = function () {
  return this._failures === 0;
};
Is.prototype.raise = function () {
  var errors = this._errors;
  if (this._failures > 0) {
    this.clear();
    throw errors;
  }
};
Is.prototype.create = function () {
  return new Is();
};

var name, is = module.exports = new Is();

for (name in validators) {
  if (validators.hasOwnProperty(name)) {
    is.addTest(name, validators[name]);
  }
}

for (name in manipulators) {
  if (manipulators.hasOwnProperty(name)) {
    is.addCast(name, manipulators[name]);
  }
}
