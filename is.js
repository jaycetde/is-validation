'use strict';

var builtIns = require('./builtins')
	, helpers = require('./helpers');

/**
 * Exception that is thrown from a chain
 *
 * @constructor
 * @this {ValidationException}
 * @param {string} msg Constructed message of all error messages
 */
var ValidationException = function (msg) {
	this.name = "ValidationException";
	this.message = msg;
};
/**
 * Exception that is thrown from is
 *
 * @constructor
 * @this {ValidationsException}
 * @param {array} msgs List of constructed error messages
 */
var ValidationsException = function (msgs) {
	this.name = "ValidationsException";
	this.messages = msgs;
};

/**
 * Create a new instance of Is with private error queues
 *
 * @constructor
 * @this {Is}
 * @return {Is} Constructed instance
 */
var Is = function () {
	this.clear();
	return this;
};

/**
 * Creates a chain instance
 *
 * @constructor
 * @this {Chain}
 * @param {!Object} val The value the chain is focused on
 * @param {string} name A human-readable name of the value
 */
var Chain = function (val, name) {

	this._val = helpers.cloneObj(val); // uses cloneObj to prevent affecting original objects through reference
	this._name = name;

	this.clear();

	return this;

};

/**
 * Default error format for top-level chains
 * {0}: val name
 * {1}: constructed error list
 */
Chain.prototype._errorFormat = "{0} must {1}";
/**
 * Default error format for non-top-level chains
 * {0}: val name
 * {1}: constructed error list
 */
Chain.prototype._propFormat = "have a {0} which must {1}";

/**
 * Changes the format of the error message returned
 * {0} - The variables name
 * {1} - The list of errors
 *
 * @return {Chain} this
 */
Chain.prototype.errorFormat = function (format) {
	this._errorFormat = format;
	return this;
};

/**
 * Change the format of property error segments of the error message
 * {0} - The property name
 * {1} - The list of errors
 *
 * @return {Chain} this
 */
Chain.prototype.propFormat = function (format) {
	this._propFormat = format;
	return this;
};

/**
 * Creates a new chain focused on the property name of current chain
 *
 * @param {string} prop Name of property to change focus to
 * @param {string} name A human readable name of the property
 * @return {Chain} A new chain focused on property value
 */
Chain.prototype.prop = function (prop, name) {
	var p = new Chain(this._val[prop], name || prop);
	p._up = this;
	p._propName = prop;
	this._registered.push(p);
	if (this._bypass || typeof(this._val[prop]) === "undefined") {
		p._bypass = true;
	}
	return p;
};
/**
 * Manipulates the current chain value using a supplied function
 *
 * @param {function} fn Accepts the val and returns the manipulated val
 * @param {string} name Manipulated value name
 * @return {Chain} A new chain focused on the manipulated value
 */
Chain.prototype.manip = function (fn, name) {
	var val = fn.call(this, this._val)
	, c = new Chain(val, name || 'manipulated value');
	c._up = this;
	this._registered.push(c);
	if (this._bypass) {
		c._bypass = true;
	}
	return c;
};

/**
 * Bypasses all future tests and manipulations
 *
 * @return {Chain} this
 */
Chain.prototype.stop = function () {
	this._bypass = true;
	return this;
};

/**
 * Stop bypassing future tests and manipulations
 * 
 * @return {Chain} this
 */
Chain.prototype.resume = function () {
	this._bypass = false;
	return this;
};

Chain.prototype.not = function () {
	this._negate = true;
	return this;
};

/**
 * Starts Bypassing future tests and manipulations if any errors occured
 *
 * @return {Chain} this
 */
Chain.prototype.stopIfErrs = function () {
	if (!this.valid()) {
		this.stop();
	}
	return this;
};

/**
 * Provides access to previous chains of .prop and .manip
 *
 * @return {Chain} this
 */
Chain.prototype.up = function () {
	return this._up;
};

/**
 * Rebuilds current value by replacing the properties with manipulated values
 *
 * @return {Chain} this
 */
Chain.prototype.constructProps = function () {
	var i, l = this._registered.length;
	for (i = 0; i < l; i += 1) {
		this._val[this._registered[i]._propName] = this._registered[i].val();
	}
	return this;
};

/**
 * Get the current manipulated value
 * 
 * @return {Object} The manipulated value
 */
Chain.prototype.val = function () {
	return this.constructProps()._val;
};

/**
 * Clears chain of all errors and children chains
 *
 * @return {Chain} this
 */
Chain.prototype.clear = function () {
	this._registered = [];
	this._errors = [];
	this._testCount = 0;
	this._errCount = 0;
	return this;
};

/**
 * Used internally if an error occurs in the chain
 *
 * @param {string} msg A formatted message describing the error
 * @return {Chain} this
 */
Chain.prototype.addError = function (msg) {
	this._errors.push(msg);
	this._errCount += 1;
	return this;
};

/**
 * Used internally to construct the list of errors excluding the subject
 *
 * @return {string} Human-readable list of errors
 */
Chain.prototype.errorList = function () {
	var i, errs = this._errors.slice(0);
	for (i = 0; i < this._registered.length; i += 1) {
		if (this._registered[i].errCount() > 0) {
			errs.push(helpers.formatStr(this._propFormat, this._registered[i]._name, this._registered[i].errorList()));
		}
	}
	return helpers.stringListJoin(errs);
};

/**
 * Constructs a human-readable message describing all the errors in the chain
 *
 * @return {string} Human-readable list of errors
 */
Chain.prototype.errorMessage = function () {
	if (this.valid()) {
		return;
	}
	var list = this.errorList();
	return helpers.formatStr(this._errorFormat, this._name, list);
};

/**
 * The number of tests that have been run in the chain
 *
 * @return {number} The number of tests ran
 */
Chain.prototype.testCount = function () {
	var i, count = this._testCount;
	for (i = 0; i < this._registered.length; i += 1) {
		count += this._registered[i].testCount();
	}
	return count;
};

/**
 * The number of errors that have occured in the chain
 *
 * @return {number} The number of errors
 */
Chain.prototype.errCount = function () {
	var i, count = this._errCount;
	for (i = 0; i < this._registered.length; i += 1) {
		count += this._registered[i].errCount();
	}
	return count;
};

/**
 * @return {boolean} If the chain has no errors
 */
Chain.prototype.valid = function () {
	return this.errCount() === 0;
};

/**
 * Throws an exception if there are any errors in the chain
 *
 * @return {Chain} this
 */
Chain.prototype.throwErr = function () {
	if (this.errCount() > 0) {
		var msg = this.errorMessage();
		this.clear();
		throw new ValidationException(msg);
	}
	return this;
};


/**
 * Creates a new chain and registers it to this instance of Is
 *
 * @param {Object} val The value used in the chain
 * @param {string} name The name of the value used in the chain
 * @return {Chain} A constructed chain object
 */
Is.prototype.that = function (val, name) {

	if (!(this instanceof Is)) {
		throw new Error('Not an instance');
	}

	var c = new Chain(val, name || 'value');
	this._registered.push(c);

	return c;

};

/**
 * Extends Is and Chain with a new test function
 *
 * @param {string} name The name the test will be available by
 * @param {function} fn The test function. Returns true or false
 * @return {Is} this
 */
Is.prototype.addTest = function (name, fn) {
	Is.prototype[name] = fn;
	Chain.prototype[name] = function () {
		if (this._bypass) {
			return this;
		}
		var args = Array.prototype.slice.call(arguments)
			, msg = (this._negate ? 'not ' : '') + fn.failMessage || 'pass ' + name + ' test'
			, result
		;

		args = [this._val].concat(args);

		if (args.length > fn.length) {
			msg = args.pop();
		}

		result = fn.apply(null, args);

		if ((this._negate && result) || (!this._negate && !result)) {
			this.addError(helpers.formatStr(msg, args));
		}

		delete this._negate;

		this._testCount += 1;
		return this;
	};
	return this;
};

/**
 * Extends Is and Chain with a new manipulation function
 *
 * @param {string} name The name the manipulation will be available by
 * @param {function} fn The manipulation function. Returns manipulated value
 * @return {Is} this
 */
Is.prototype.addManip = function (name, fn) {
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
	return this;
};

/**
 * Creates a list of error messages
 *
 * @return {array} List of human-readable error messages
 */
Is.prototype.errorMessages = function () {
	if (this.valid()) {
		return;
	}
	var i, messages = [];
	for (i = 0; i < this._registered.length; i += 1) {
		messages.push(this._registered[i].errorMessage());
	}
	return messages;
};

/**
 * Adds up all tests ran in this instance
 *
 * @return {number} The number of tests ran
 */
Is.prototype.testCount = function () {
	var i, count = 0;
	for (i = 0; i < this._registered.length; i += 1) {
		count += this._registered[i].testCount();
	}
	return count;
};

/**
 * Adds up all errors occured in this instance
 *
 * @return {number} The number of errors
 */
Is.prototype.errCount = function () {
	var i, count = 0;
	for (i = 0; i < this._registered.length; i += 1) {
		count += this._registered[i].errCount();
	}
	return count;
};

/**
 * Reset all errors and tests recoreded
 *
 * @return {Is} this
 */
Is.prototype.clear = function () {
	this._registered = [];
	return this;
};

/**
 * True if the instance has no errors
 *
 * @return {boolean} Has no errors
 */
Is.prototype.valid = function () {
	return this.errCount() === 0;
};

/**
 * Throws an exception if there are any errors
 *
 * @return {Is} this
 */
Is.prototype.throwErrs = function () {
	if (this.errCount() > 0) {
		var msgs = this.errorMessages();
		this.clear();
		throw new ValidationsException(msgs);
	}
	return this;
};

/**
 * Creates and returns a new instance of Is
 *
 * @return {Is} A new instance
 */
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
		is.addManip(name, builtIns.manipulators[name]);
	}
}
