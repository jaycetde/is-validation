var util = require('./util');

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
 * Creates a chain instance
 *
 * @constructor
 * @this {Chain}
 * @param {!Object} val The value the chain is focused on
 * @param {string} name A human-readable name of the value
 */
function Chain(val, name) {
    if (!(this instanceof Chain)) return new Chain(val, name);

	this._val = val;
	this._name = name;

	this.clear();

	return this;

};

var returnThisGetter = {
    get: function () {
        return this;
    }
};

Object.defineProperties(Chain.prototype, {
    a: returnThisGetter,
    an: returnThisGetter,
    and: returnThisGetter,
    or: {
        get: function () {
            
            this._afterOr = true;
            
            if (this._last) {
                this._skipNext = true;
                return this;
            }
            
            if (!this._or) {
                this._or = [ this._errors.pop() ];
            } else {
                this._errors.pop();
            }
            
            this._errCount -= 1;
            
            return this;
        }
    },
    valid: {
        get: function () {
            return this.errorCount === 0;
        }
    },
    errorCount: {
        get: function () {
            var i = 0
              , l = this._registered.length
              , count = this._errCount
            ;
            
            while (i < l) {
                count += this._registered[i].errorCount;
                i += 1;
            }
            
            return count;
        }
    },
    testCount: {
        get: function () {
            var i = 0
              , l = this._registered.length
              , count = this._testCount
            ;
            
            while (i < l) {
                count += this._registered[i].testCount;
                i += 1;
            }
            
            return count;
        }
    },
    errorMessage: {
        get: function () {
            if (this.valid)
                return;
            
            return util.formatStr(this._errorFormat, this._name, this.errorList);
        }
    },
    errorList: {
        get: function () {
            var i = 0
              , l = this._registered.length
              , errs = this._errors.slice(0)
            ;
            
            while (i < l) {
                if (!this._registered[i].valid)
                    errs.push(util.formatStr(this._propFormat, this._registered[i]._name, this._registered[i].errorList));
                i += 1;
            }
            
            return util.stringListJoin(errs);
        }
    },
    not: {
        get: function () {
            this._negate = true;
            return this;
        }
    },
    value: {
        get: function () {
            return this.constructProps()._val;
        }
    },
    firstParentVal: { // might need a rename
        get: function () {
            var chain = this;
            while(chain._up) {
                chain = chain._up;
            }
            return chain.val;
        }
    }
});

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
Chain.prototype.property = function (prop, name) {
    // TODO: figure out how to handle undefined && null - undefined[prop] will throw an exception
	var p = new Chain((this._val !== undefined && this._val !== null) ? this._val[prop] : undefined, name || prop); // Use property name as name if not specified
	p._up = this;
	p._propName = prop;
	this._registered.push(p);
	if (this._bypass) { // Continue bypassing
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
Chain.prototype.manipulate = function (fn, failVal, failMessage) {
	if (this._bypass) {
		return this;
	}
    
    var result = fn.call(this, this._val);
    
    if (typeof failVal !== 'undefined') {
        
        if ((typeof failVal === 'function' && failVal(result) === true)
                || result === failVal) {
            this._bypass = true;
            this.addError(failMessage || 'be able to be manipulated');
        }
        
    }
    
    this._val = result;
	
	return this;
};

/**
 * Create and use a single-use validate function
 *
 * @param {function} fn Accepts the val and returns true / false
 * @param {string} failMessage Message segment used on failure
 * @return {Chain} this
 */
Chain.prototype.validate = function (fn, failMessage) {
	if (this._bypass) {
		return this;
	}
    
    failMessage = failMessage || 'pass a validation test';

	var result = fn(this._val);
    
    if (this._negate) {
        failMessage = 'not ' + failMessage;
        result = !result;
        this._negate = false;
    }

	if (!result) {
		this.addError(util.formatStr(failMessage, this._val));
	}
	
	this._testCount += 1;
	return this;
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

/**
 * Starts Bypassing future tests and manipulations if any errors occured
 *
 * @return {Chain} this
 */
Chain.prototype.ifValid = function () {
	if (!this.valid) {
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
    var i = 0
      , l = this._registered.length
    ;
    
    while (i < l) {
        this._val[this._registered[i]._propName] = this._registered[i].val;
        i += 1;
    }
    
    return this;
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
        
        this._afterOr = false;
        this._skipNext = false;
        this._negate = false;
        this._bypass = false;
        this._last = false;

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
 * Throws an exception if there are any errors in the chain
 *
 * @return {Chain} this
 */
Chain.prototype.throwError = function () {
	if (!this.valid) {
		var msg = this.errorMessage;
		this.clear();
		throw new ValidationException(msg);
	}
	return this;
};

module.exports = Chain;
