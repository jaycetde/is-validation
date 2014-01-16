var is = require('..')
  , should = require('should')
  , util = require('util')
;

function test(method, pass, fail) {
    describe(method, function () {
        
        describe('static', function () {
            
            var combined = pass.concat(fail);
            
            combined.forEach(function (arr) {
                it('should manipulate ' + util.inspect(arr[0]) + ' to ' + util.inspect(arr[1]), function () {
                    if (typeof arr[1] === 'function') {
                        arr[1](is[method].apply(null, arr[0])).should.be.true;
                    } else {
                        should(is[method].apply(null, arr[0])).eql(arr[1]);
                    }
                });
            });

        });
        
        describe('chain', function () {
            
            pass.forEach(function (arr) {
                it('should pass for ' + util.inspect(arr), function () {
                    
                    is.clear();
                    
                    var args = arr[0].slice(0)
                      , val = args.shift()
                      , chain = is(val)
                    ;
                    
                    chain.valid.should.be.true;
                    
                    chain[method].apply(chain, args);
                    
                    chain.valid.should.be.true;
                    
                    if (typeof arr[1] === 'function') {
                        arr[1](chain.value).should.be.true;
                    } else {
                        should(chain.value).eql(arr[1]);
                    }
                    
                });
            });
            
            fail.forEach(function (arr) {
                it('should fail for ' + util.inspect(arr), function () {
                    
                    is.clear();
                    
                    var args = arr[0].slice(0)
                      , val = args.shift()
                      , chain = is(val)
                    ;
                    
                    chain.valid.should.be.true;
                    
                    chain[method].apply(chain, args);
                    
                    chain.valid.should.be.false;
                    
                    if (typeof arr[1] === 'function') {
                        arr[1](chain.value).should.be.true;
                    } else {
                        should(chain.value).eql(arr[1]);
                    }
                    
                });
            });
            
        });
        
    });
}

describe('built-in manipulators', function () {
    
            
    test(
        'toString'
      , [
          [ [ true ], 'true' ]
        , [ [ false ], 'false' ]
        , [ [ 123 ], '123' ]
        , [ [ 'abc' ], 'abc' ]
        , [ [ undefined ], '' ]
        , [ [ null ], '' ]
        , [ [ { hello: 'world', number: 5 } ], '{"hello":"world","number":5}' ]
      ]
      , []
    );
    
    test(
        'toInteger'
      , [
          [[123], 123]
        , [[12.3], 12]
        , [[1.23e1], 12]
        , [['123'], 123]
        , [['12.3'], 12]
        , [['123mb'], 123]
        , [['1.23e1'], 1]
      ]
      , [
          [['abc'], isNaN]
        , [[''], isNaN]
        , [[true], isNaN]
        , [[undefined], isNaN]
        , [[null], isNaN]
      ]
    );
    
    test(
        'toNumber'
      , [
          [[123], 123]
        , [[12.3], 12.3]
        , [[1.23e1], 1.23e1]
        , [['123'], 123]
        , [['12.3'], 12.3]
        , [['1.23e1'], 1.23e1]
        , [[true], 1]
        , [[false], 0]
        , [[null], 0]
      ]
      , [
          [['abc'], isNaN]
        , [['123mb'], isNaN]
        , [[undefined], isNaN]
        , [[''], isNaN]
      ]
    );
    
    test(
        'toFloat'
      , [
          [[123], 123]
        , [[12.3], 12.3]
        , [[1.23e1], 1.23e1]
        , [['123'], 123]
        , [['12.3'], 12.3]
        , [['12.3mb'], 12.3]
        , [['1.23e1'], 1.23e1]
      ]
      , [
          [['abc'], isNaN]
        , [[''], isNaN]
        , [[true], isNaN]
        , [[undefined], isNaN]
        , [[null], isNaN]
      ]
    );
    
    var date = new Date();
    
    test(
        'toDate'
      , [
          [[date], date]
        , [[date.getTime()], date]
        //, [[date.toString()], date] // String dates drop milliseconds; considering an alternate date parser
      ]
      , [
          [['abc'], isNaN]
        , [[undefined], isNaN]
        , [[true], isNaN]
        , [[false], isNaN]
        , [[null], isNaN]
      ]
    );
    
    test(
        'trim'
      , [
          [['   abc'], 'abc']
        , [['abc   '], 'abc']
        , [['   abc   '], 'abc']
        , [['\t\r\n abc \n\r\t'], 'abc']
        , [['lllabclll', 'l'], 'abc']
        , [[null], '']
        , [[undefined], '']
        , [[true], 'true']
        , [[false], 'false']
      ]
      , []
    );
    
    test(
        'leftTrim'
      , [
          [['   abc'], 'abc']
        , [['abc   '], 'abc   ']
        , [['   abc   '], 'abc   ']
        , [['\t\r\n abc \n\r\t'], 'abc \n\r\t']
        , [['lllabclll', 'l'], 'abclll']
        , [[null], '']
        , [[undefined], '']
        , [[true], 'true']
        , [[false], 'false']
      ]
      , []
    );
    
    test(
        'rightTrim'
      , [
          [['   abc'], '   abc']
        , [['abc   '], 'abc']
        , [['   abc   '], '   abc']
        , [['\t\r\n abc \n\r\t'], '\t\r\n abc']
        , [['lllabclll', 'l'], 'lllabc']
        , [[null], '']
        , [[undefined], '']
        , [[true], 'true']
        , [[false], 'false']
      ]
      , []
    );
    
    test(
        'toBoolean'
      , [
          [[true], true]
        , [[false], false]
        , [['true'], true]
        , [['false'], false]
        , [['TRUE'], true]
        , [['FALSE'], false]
        , [[1], true]
        , [[0], false]
        , [['abc'], true]
        , [[''], false]
        , [[{}], true]
        , [[null], false]
        , [[undefined], false]
      ]
      , []
    );
    
    test(
        'toRegExp'
      , [
          [[/hello/i], /hello/i]
        , [['/hello/i'], /hello/i]
        , [['hello'], /hello/]
      ]
      , [
          [[123], null]
        , [[true], null]
        , [[null], null]
      ]
    );
    
});