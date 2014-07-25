var Chain = require('./chain')
  , util = require('./util')

  , noop = function () {}
;

/**
 * Exception that is thrown from is
 *
 * @constructor
 * @this {ValidationsException}
 * @param {array} msgs List of constructed error messages
 */
var ValidationsException = function (msgs) {
    Error.call(this, "ValidationsException");
	this.name = "ValidationsException";
	this.messages = msgs;
};


module.exports = is;

function is(val, name) {

    var chain = new Chain(val, name || 'value');
    is._registered.push(chain);

    return chain;
    
}

// expose ValidationsException
is.ValidationsException = ValidationsException;

// expose Chain through is
is.Chain = Chain;

var returnIsGetter = {
    get: function () {
        return is;
    }
};

Object.defineProperties(is, {
    a: returnIsGetter,
    an: returnIsGetter,
    valid: {
        get: function () {
            return is.errorCount === 0;
        }
    },
    testCount: {
        get: function () {
            var i = 0
              , l = is._registered.length
              , count = 0
            ;
            
            while (i < l) {
                count += is._registered[i].testCount;
                i += 1;
            }
            
            return count;
        }
    },
    errorCount: {
        get: function () {
            var i = 0
              , l = is._registered.length
              , count = 0
            ;
            
            while (i < l) {
                count += is._registered[i].errorCount;
                i += 1;
            }
            
            return count;
        }
    },
    errorMessages: {
        get: function () {
            if (is.valid)
                return;
            
            var i = 0
              , l = is._registered.length
              , messages = []
            ;
            
            while (i < l) {
                if (!is._registered[i].valid)
                    messages.push(is._registered[i].errorMessage);
                i += 1;
            }
            
            return messages;
        }
    }
});

is.clear = function () {
    is._registered = [];
    return is;
};

is.throwErrors = function () {
    var msgs = is.errorMessages;
    if (msgs) {
		is.clear();
		throw new ValidationsException(msgs);
	}
	return is;
};

is.configure = {
    addValidator: function (name, fn, options) {
        // check for name on is and Chain
        if (util.existsOn(is, name) || util.existsOn(Chain.prototype, name)) {
            throw new Error('`' + name + '` already exists on `is` or `is.Chain.prototype`');
        }
        
        options = options || {};
        
        is[name] = fn;
        
        options.failMessage = options.failMessage || fn.failMessage || 'pass ' + name + ' test';
        
        Chain.prototype[name] = function () {
            
            if (this._or && !this._afterOr) {
                delete this._or;
            }
            
            this._afterOr = false;
            
            if (this._bypass) { // Don't run the test if currently set to bypass
                return this;
            }
            
            if (this._skipNext) {
                this._skipNext = false;
                return this;
            }
            
            var args = [this._val].concat(Array.prototype.slice.call(arguments))
              , failMessage
              , result
            ;
    
            if (args.length > fn.length) { // More arguments than function accepts
                failMessage = args.pop(); // Set failMessage as last argument
            }
            
            failMessage = failMessage || options.failMessage;
    
            result = fn.apply(this, args);
            
            if (this._negate) {
                failMessage = 'not ' + failMessage;
                result = !result;
                this._negate = false;
            }
            
            if (!result) {
                var formattedMessage = util.formatStr.apply(null, [failMessage].concat(args));
                if (this._or) {
                    this._or.push(formattedMessage);
                    formattedMessage = util.stringListJoin(this._or, 'or');
                }
                this.addError(formattedMessage);
            } else if (this._or) {
                delete this._or;
            }
    
            this._last = result;
    
            this._testCount += 1;
            return this;
        };
        return is;
    },
    addManipulator: function (name, fn, options) {
        if (util.existsOn(is, name) || util.existsOn(Chain.prototype, name)) {
            throw new Error('`' + name + '` already exists on `is` or `is.Chain.prototype`');
        }
        
        options = options || {};
        
        is[name] = fn;
        
        var failVal = typeof options.failVal !== 'undefined' ? options.failVal : fn.failVal;
        
        options.failMessage = options.failMessage || fn.failMessage || 'be able to be manipulated by ' + name;
        
        Chain.prototype[name] = function () {
            if (this._bypass) {
                return this;
            }
            
            var args = [this._val].concat(Array.prototype.slice.call(arguments))
              , failMessage
              , result
            ;
            
            if (args.length > fn.length) {
                failMessage = args.pop();
            }
            
            failMessage = failMessage || options.failMessage;
            
            result = fn.apply(this, args);
            
            if (typeof failVal !== 'undefined') {
                
                if ((typeof failVal === 'function' && failVal(result) === true)
                        || result === failVal) {
                    this._bypass = true;
                    this.addError(failMessage);
                }
                
            }
            
            this._val = result;
            
            return this;
            
        };
        return is;
    }
};

// initializes _registered
is.clear();

require('./validators')(is);
require('./manipulators')(is);