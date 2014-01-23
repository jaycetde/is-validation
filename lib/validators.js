var deepEqual = require('deepequal')
  , isArgs = require('is-args')
;

function objectConstructor(Constructor) {
    return function (obj) {
        return obj !== undefined && obj !== null && obj.constructor === Constructor;
    };
}

module.exports = function (is) {
    
    function validator(name, fn, failMessage) {
        is.configure.addValidator(name, fn, failMessage ? { failMessage: failMessage } : undefined);
    }
    
    validator(
        'string'
      , objectConstructor(String)
      , 'be a string'
    );
    
    validator(
        'number'
      , function (val) {
          return val !== true && val !== false && is.trim(val) !== '' && isFinite(val) && !isNaN(Number(val));
      }
      , 'be numeric'
    );
    
    validator(
        'strictNumber'
      , objectConstructor(Number)
      , 'be a number'
    );
    
    validator(
        'lessThan'
      , function (val, limit) {
          return val < limit;
      }
      , 'be less than {1}'
    );
    
    validator(
        'lessThanEqual'
      , function (val, limit) {
          return val <= limit;
      }
      , 'be less than or equal to {1}'
    );
    
    validator(
        'greaterThan'
      , function (val, limit) {
          return val > limit;
      }
      , 'be greater than {1}'
    );
    
    validator(
        'greaterThanEqual'
      , function (val, limit) {
          return val >= limit;
      }
      , 'be greater than or equal to {1}'
    );
    
    validator(
        'between'
      , function (val, lower, upper) {
          return val > lower && val < upper;
      }
      , 'be between {1} and {2}'
    );
    
    validator(
        'within'
      , function (val, lower, upper) {
          return val >= lower && val <= upper;
      }
      , 'be within {1} and {2}'
    );
    
    validator(
        'equal'
      , function (val, expected) {
          return deepEqual(val, expected);
      }
      , 'equal {1}'
    );
    
    validator(
        'strictEqual'
      , function (val, expected) {
          return val === expected;
      }
      , 'equal {1}'
    );
    
    validator(
        'strictBoolean'
      , function (val) {
          return val === true || val === false;
      }
      , 'be true or false'
    );
    
    validator(
        'date'
      , function (val) {
          return val instanceof Date || !isNaN(new Date(val));
      }
      , 'be a valid date'
    );
    
    validator(
        'strictDate'
      , objectConstructor(Date)
      , 'be a date'
    );
    
    validator(
        'object'
      , function (val) {
          return val !== null && typeof val === 'object';
      }
      , 'be an object'
    );
    
    validator(
        'literalObject'
      , objectConstructor(Object)
      , 'be an object literal'
    );
    
    validator(
        'inside'
      , function (val, arr) {
          return arr.indexOf(val) !== -1;
      }
      , 'be inside an array'
    );
    
    validator(
        'haveProperty'
      , function (val, prop) {
          return typeof val[prop] !== 'undefined'; // could use `return prop in val` - but not helpful if val is undefined;
      }
      , 'have a `{1}` property'
    );
    
    validator(
        'haveOwnProperty'
      , function (val, prop) {
          return val && val.hasOwnProperty && val.hasOwnProperty(prop);
      }
      , 'have a `{1}` property'
    );
    
    validator(
        'match'
      , function (val, reg) {
          return reg.test(val);
      }
      , 'match an expression'
    );
    
    validator(
        'function'
      , objectConstructor(Function)
      , 'be a function'
    );
    
    // must use `args` instead of `arguments` because is.arguments is used by javascript
    validator(
        'args'
      , isArgs
      , 'be arguments'
    );
    
    validator(
        'regExp'
      , objectConstructor(RegExp)
      , 'be a regular expression'
    );
    
    validator(
        'instanceOf'
      , function (val, constructor) {
          return val instanceof constructor;
      }
      , 'be an instance of a constructor'
    );
    
    validator(
        'array'
      , Array.isArray || objectToString('Array')
      , 'be an array'
    );
    
    validator(
        'buffer'
      , typeof Buffer === 'function' && Buffer.isBuffer ? Buffer.isBuffer : function (val) { return false; } // if Buffer is not a global, then `val` cannot be a Buffer
      , 'be a buffer'
    );
    
    validator(
        'empty'
      , function (val) {
          if (is.string(val) || is.array(val) || is.args(val)) {
              return val.length === 0;
          } else {
              var empty = true
                , prop
              ;
              
              for (prop in val) {
                  if (Object.prototype.hasOwnProperty.call(val, prop)) {
                      empty = false;
                      break;
                  }
              }
              
              return empty;
          }
          return false;
      }
      , 'be empty'
    );
    
};