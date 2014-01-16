var whitespaceChars = '\\r\\n\\t\\s'
  , regExpReg = /^\/(.*)\/([gimy]*)$/i
;

module.exports = function (is) {
    
    var manipulator = is.configure.addManipulator;
    
    manipulator(
        'toString'
      , function (val) {
          return (val === undefined || val === null) ? '' : is.literalObject(val) ? JSON.stringify(val) : String(val);
      }
    );
    
    manipulator(
        'trim'
      , function (str, chars) {
          chars = chars || whitespaceChars;
		  return is.toString(str).replace(new RegExp('^['+chars+']+|['+chars+']+$', 'g'), '');
      }
    );
    
    manipulator(
        'leftTrim'
      , function (str, chars) {
          chars = chars || whitespaceChars;
          return is.toString(str).replace(new RegExp('^['+chars+']+', 'g'), '');
      }
    );
    
    manipulator(
        'rightTrim'
      , function (str, chars) {
          chars = chars || whitespaceChars;
		  return is.toString(str).replace(new RegExp('['+chars+']+$', 'g'), '');
      }
    );
    
    manipulator(
        'toNumber'
      , function (val) {
          if (is.string(val) && is.trim(val) === '') {
              return NaN;
          }
          return Number(val);
      }
      , {
          failVal: isNaN
        , failMessage: 'be a number'
      }
    );
    
    manipulator(
        'toInteger'
      , function (val, radix) {
          radix = typeof radix !== 'undefined' ? radix : 10;
          return parseInt(val, radix);
      }
      , {
          failVal: isNaN
        , failMessage: 'be an integer'
      }
    );
    
    manipulator(
        'toFloat'
      , parseFloat
      , {
          failVal: isNaN
        , failMessage: 'be a floating point number'
      }
    );
    
    manipulator(
        'toBoolean'
      , function (val) {
          if (!val || val === '0' || (is.string(val) && val.toLowerCase() === 'false') || val === '') return false;
          return true;
      }
    );
    
    manipulator(
        'toDate'
      , function (val) {
          if (is.strictDate(val)) return val;
          if (val === null || val === undefined || is.strictBoolean(val)) return NaN;
          return new Date(val);
      }
      , {
          failVal: isNaN
        , failMessage: 'be a valid date'
      }
    );
    
    manipulator(
        'toRegExp'
      , function (val) {
          if (is.string(val)) {
              var segs = regExpReg.exec(val);
              if (segs) {
                  return new RegExp(segs[1], segs[2]);
              }
              return new RegExp(val);
          }
          return is.regExp(val) ? val : null;
      }
      , {
          failVal: null
        , failMessage: 'be a regular expression'
      }
    );
    
    manipulator(
        'default'
      , function (orig, val, compare) {
          if ((typeof compare === 'function' && compare(orig) === true) || orig === compare) {
              orig = val;
          }
          return orig;
      }
    );
    
};