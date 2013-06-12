var Chain = require('./chain')
  , builtIns = require('./builtins')
  , helpers = require('./helpers')
;

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
		if (this._bypass) { // Don't run the test if currently set to bypass
			return this;
		}
		var args = Array.prototype.slice.call(arguments)
			, msg = (this._negate ? 'not ' : '') + fn.failMessage || 'pass ' + name + ' test' // compose a default failMessage
			, result
		;

		args = [this._val].concat(args);

		if (args.length > fn.length) { // More arguments than function accepts
			msg = args.pop(); // Set failMessage as last argument
		}

		result = fn.apply(null, args);

		if ((this._negate && result) || (!this._negate && !result)) {
			this.addError(helpers.formatStr.apply(null, [msg].concat(args)));
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
		if (!this._registered[i].valid()) {
			messages.push(this._registered[i].errorMessage());
		}
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
