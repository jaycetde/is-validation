'use strict';

var builtIns = require('./builtins')
	, helpers = require('./helpers');

// Custom Exception Classes
var ValidationException = function (msg) {
	this.name = "ValidationException";
	this.message = msg;
};
var ValidationsException = function (msgs) {
	this.name = "ValidationsException";
	this.messages = msgs;
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
Chain.prototype.manip = function (fn, name) {
	var val = fn.call(this, this._val)
	, c = new Chain(val, name || 'manipulated value');
	c._up = this;
	this._registered.push(c);
	return c;
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
	this._testCount = 0;
	this._errCount = 0;
	return this;
};
Chain.prototype.addError = function (msg) {
	this._errors.push(msg);
	this._errCount += 1;
	return this;
};
Chain.prototype.errorList = function () {
	var i, errs = this._errors.slice(0);
	for (i = 0; i < this._registered.length; i += 1) {
		if (this._registered[i].errCount() > 0) {
			errs.push(helpers.formatStr(this.propFormat, this._registered[i]._name, this._registered[i].errorList()));
		}
	}
	return helpers.stringListJoin(errs);
};
Chain.prototype.errorMessage = function () {
	var list = this.errorList();
	return helpers.formatStr(this.errorFormat, this._name, list);
};
Chain.prototype.testCount = function () {
	var i, count = this._testCount;
	for (i = 0; i < this._registered.length; i += 1) {
		count += this._registered[i].testCount();
	}
	return count;
};
Chain.prototype.errCount = function () {
	var i, count = this._errCount;
	for (i = 0; i < this._registered.length; i += 1) {
		count += this._registered[i].errCount();
	}
	return count;
};
Chain.prototype.valid = function () {
	return this.errCount() === 0;
};
Chain.prototype.throwErr = function () {
	if (this.errCount() > 0) {
		var msg = this.errorMessage();
		this.clear();
		throw new ValidationException(msg);
	}
	return this;
};

Is.prototype.that = function (val, name) {

	if (!(this instanceof Is)) {
		throw new Error('Not an instance');
	}

	var c = new Chain(val, name || 'value');
	this._registered.push(c);

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
			this.addError(response);
		}
		this._testCount += 1;
		return this;
	};
};
Is.prototype.addCast = function (name, fn) {
	Is.prototype[name] = fn;
	Chain.prototype[name] = function () {
		if (this._bypass) {
			return this;
		}
		var args = Array.prototype.slice.call(arguments)
		, val = fn.apply(null, [this._val].concat(args));
		if (typeof(fn.failVal) !== "undefined"
				&& ((typeof(fn.failVal) === "function" && fn.failVal.call(this, val))
						|| val === fn.failVal)) {
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
Is.prototype.errorMessages = function () {
	var i, messages = [];
	for (i = 0; i < this._registered.length; i += 1) {
		messages.push(this._registered[i].errorMessage());
	}
	return messages;
};
Is.prototype.testCount = function () {
	var i, count = 0;
	for (i = 0; i < this._registered.length; i += 1) {
		count += this._registered[i].testCount();
	}
	return count;
};
Is.prototype.errCount = function () {
	var i, count = 0;
	for (i = 0; i < this._registered.length; i += 1) {
		count += this._registered[i].errCount();
	}
	return count;
};
Is.prototype.clear = function () {
	this._registered = [];
	return this;
};
Is.prototype.valid = function () {
	return this.errCount() === 0;
};
Is.prototype.throwErrs = function () {
	if (this.errCount() > 0) {
		var msgs = this.errorMessages();
		this.clear();
		throw new ValidationsException(msgs);
	}
	return this;
};
Is.prototype.create = function () {
	return new Is();
};

var name, is = module.exports = new Is();

for (name in builtIns.validators) {
	if (builtIns.validators.hasOwnProperty(name)) {
		is.addTest(name, builtIns.validators[name]);
	}
}

for (name in builtIns.manipulators) {
	if (builtIns.manipulators.hasOwnProperty(name)) {
		is.addCast(name, builtIns.manipulators[name]);
	}
}
