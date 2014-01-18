var is = require('..')
  , util = require('util')
  , should = require('should')
;

function Instance() {}

function test(method, pass, fail) {
    
    describe(method, function () {
        
        describe('static', function () {
            pass.forEach(function (args) {
                it('should pass for ' + util.inspect(args), function () {
                    is[method].apply(null, args).should.be.true;
                });
            });
            
            fail.forEach(function (args) {
                it('should fail for ' + util.inspect(args), function () {
                    is[method].apply(null, args).should.be.false;
                });
            });
        });
        
        describe('chain', function () {
            pass.forEach(function (args) {
                
                it('should pass for ' + util.inspect(args), function () {
                    
                    is.clear();
                    
                    args = args.slice(0);
                    
                    var chain = is(args.shift());
                    
                    chain.valid.should.be.true;
                    
                    chain[method].apply(chain, args);
                    
                    chain.valid.should.be.true;
                    
                    chain.clear();
                    
                    chain.valid.should.be.true;
                    
                    chain.not[method].apply(chain, args);
                    
                    chain.valid.should.be.false;
                    
                });
                
            });
            
            fail.forEach(function (args) {
                
                it('should fail for ' + util.inspect(args), function () {
                    
                    is.clear();
                    
                    args = args.slice(0);
                    
                    var chain = is(args.shift());
                    
                    chain.valid.should.be.true;
                    
                    chain[method].apply(chain, args);
                    
                    chain.valid.should.be.false;
                    
                    chain.clear();
                    
                    chain.valid.should.be.true;
                    
                    chain.not[method].apply(chain, args);
                    
                    chain.valid.should.be.true;
                    
                });
                
            });
        });
        
    });
    
}

describe('built-in validators', function () {
    
    var args = (function () { return arguments; })(1, 2, 3)
      , obj = {}
    ;
    
    test(
        'string'
      , [['abc'], ['123'], ['']]
      , [[123], [true], [{}], [[]], [null], [undefined]]
    );
    
    test(
        'number'
      , [[123], [456.789], [-12], [13e5], [-13e-6], ['12'], ['-123.456'], ['2.54e3']]
      , [[NaN], [Infinity], ['hello'], [true], [false], [[]], [{}], ['']]
    );
        
    test(
        'strictNumber'
      , [[0], [123], [1.23e15], [-123.01]]
      , [[''], ['123'], ['abc'], [true], [false], [[]], [{}], [null], [undefined]]
    );
        
    test(
        'lessThan'
      , [[0, 1], [100, 200], ['a', 'b']]
      , [[1, 0], [1, 1], [200, 100], ['b', 'a']]
    );

    test(
        'greaterThan'
      , [[1, 0], [200, 100], ['b', 'a']]
      , [[0, 1], [100, 200], [1, 1], ['a', 'b']]
    );

    test(
        'lessThanEqual'
      , [[0, 1], [1, 1], [100, 200], ['a', 'b'], ['a', 'a']]
      , [[2, 1], [200, 100], ['b', 'a']]
    );
    
    test(
        'greaterThanEqual'
      , [[1, 0], [1, 1], [200, 100], ['b', 'a'], ['a', 'a']]
      , [[1, 2], [100, 200], ['a', 'b']]
    );
    
    test(
        'between'
      , [[5, 0, 10], [11.11, 11.10, 11.12]]
      , [[5, 5, 10], [10, 5, 10], [0, 5, 10], [11.10, 11.10, 11.12]]
    );
    
    test(
        'within'
      , [[5, 0, 10], [11.11, 11.10, 11.12], [5, 5, 10], [10, 5, 10], [11.10, 11.10, 11.12]]
      , [[0, 5, 10], [11.09, 11.10, 11.12], [11, 0, 10]]
    );

    test(
        'date'
      , [['Aug 9, 1995'], ['Wed, 09 Aug 1995 00:00:00 GMT'], ['Thu, 01 Jan 1970 00:00:00 GMT-0400'], ['1994-11-05T08:15:30-05:00'], ['1994-11-05T13:15:30Z'], ['1995-09-09'], ['1995-9-9'], ['1995/09/09 10:10:10'], [1336802400000]]
      , [['Aug 32, 1995'], ['notadate']]
    );
    
    test(
        'strictDate'
      , [[new Date()], [new Date(2013, 2, 12)]]
      , [[''], ['abc'], ['2013-03-12'], [123], [true], [{}], [[]], [null], [undefined]]
    );
    
    test(
        'equal'
      , [['abc', 'abc'], ['123', 123], [true, 1], [false, 0], [{ hello: 'world' }, { hello: 'world' }]]
      , [['abc', 'def'], [123, '456'], [true, 0], [false, 1], [{ hello: 'world' }, { world: 'hello' }]]
    );
    
    test(
        'strictEqual'
      , [[true, true], [false, false], [undefined, undefined], ['abc', 'abc'], [123, 123], [obj, obj]]
      , [[obj, {}], [[], []], ['abc', 123], [true, 1], [false, 0], [123, '123']]
    );
    
    test(
        'strictBoolean'
      , [[true], [false]]
      , [[''], [0], [1], ['true'], ['false'], [{}], [[]], [null], [undefined]]
    );
    
    var instance = new Instance();
    
    test(
        'object'
      , [[{}], [new Object()], [{ hello: 'world' }], [instance], [[1,2,3]], [/^reg$/]]
      , [['abc'], [123], [true], [false], [undefined], [null]]
    );
    
    test(
        'literalObject'
      , [[{}], [new Object()], [{ hello: 'world' }]]
      , [['abc'], [123], [true], [false], [undefined], [null], [[1,2,3]], [/^reg$/], [instance]]
    );
    
    test(
        'inside'
      , [['a', 'abc'], ['values', ['an', 'array', 'of', 'values']]]
      , [['d', 'abc'], ['object', ['an', 'array', 'of', 'values']]]
    );
    
    test(
        'haveProperty'
      , [['abc', 'length'], [{ hello: 'world' }, 'hello']]
      , [['abc', 'height'], [{ hello: 'world' }, 'length']]
    );
    
    test(
        'haveOwnProperty'
      , [[{ hello: 'world' }, 'hello']]
      , [['abc', 'toString']]
    );
    
    test(
        'function'
      , [[function () {}], [Math.max]]
      , [[''], ['abc'], [123], [true], [{}], [[]], [null], [undefined]]
    );
    
    test(
        'args'
      , [[args]]
      , [[[1, 2, 3]], [true], [undefined], [null]]
    );
    
    test(
        'match'
      , [['abc', /abc/], ['aBc', /abc/i]]
      , [['abc', /def/], ['aBc', /abc/]]
    );
    
    test(
        'regExp'
      , [[/^reg$/], [new RegExp('^reg$', 'g')]]
      , [[''], ['^reg$'], [123], [true], [{}], [[]], [null], [undefined]]
    );
    
    test(
        'instanceOf'
      , [[new Date(), Date], [new Number(5), Number], [{}, Object], [[], Array]]
      , [[new String('hello'), Number], [{}, Array]]
    );
    
    test(
        'array'
      , [[[1, 2, 3]], [new Array(1, 2, 3)], ['abc'.split()]]
      , [['abc'], [123], [null], [undefined], [true], [false], [args], [{}]]
    );
    
    test(
        'buffer'
      , [[new Buffer('abc')]]
      , [['abc'], [123], [null], [undefined], [true], [false], [args], [{}], [[1,2,3]]]
    );
    
    test(
        'empty'
      , [[[]], [{}], [''], [null], [undefined], [123], [true], [false]]
      , [[[1, 2, 3]], ['abc'], [{ hello: 'world' }]]
    );
    
});