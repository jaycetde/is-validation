var Chain = require('./chain')
  , helpers = require('./helpers')

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
	this.name = "ValidationsException";
	this.messages = msgs;
};

module.exports = is;

function is(val, name) {

	var chain = new Chain(val, name || 'value');
	is._registered.push(chain);

	return chain;
    
}

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
        // check for name on is and Chain just like addManipulator
        options = options || {};
        
        is[name] = fn;
        
        options.failMessage = options.failMessage || fn.failMessage || 'pass ' + name + ' test';
        
        Chain.prototype[name] = function () {
            if (this._bypass) { // Don't run the test if currently set to bypass
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
                this.addError(helpers.formatStr.apply(null, [failMessage].concat(args)));
            }
    
    
            this._testCount += 1;
            return this;
        };
        return is;
    },
    addManipulator: function (name, fn, options) {
        // check if name is on is and Chain (__lookupGetter__ and __lookupSetter__ as well)
        //if (is[name] || Chain.prototype[name]) throw new Error('that name is already in use');
        
        options = options || {};
        
        is[name] = fn;
        
        var failVal = typeof options.failVal !== 'undefined' ? options.failVal : fn.failVal;
        
        options.failMessage = options.failMessage || fn.failMessage || 'be able to be manipulated by ' + name;
        
        Chain.prototype[name] = function () {
            if (this._bypass) {
                return this;
            }
            /*
            if (options.preTests) {
                for (var test in options.preTests) {
                    
                }
            }
            */
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