var is = require('..')
  , should = require('should')
;

describe('Chain', function () {

  var chain = is(123);

  it('should be an instance of a Chain', function () {

    chain.should.be.an.instanceof(is.Chain);

  });

  it('should have expressive getters', function () {

    chain.a.should.equal(chain);
    chain.an.should.equal(chain);
    chain.a.an.should.equal(chain);

  });

  it('should not have any errors or tests and be valid', function () {

    chain.errorCount.should.equal(0);
    chain.testCount.should.equal(0);
    chain.valid.should.be.true;
    should(chain.errorMessage).not.be.ok;

  });

  it('should increment testCount', function () {

    chain.a.number();

    chain.testCount.should.equal(1);
    chain.errorCount.should.equal(0);

    chain.greaterThan(100);

    chain.testCount.should.equal(2);
    chain.errorCount.should.equal(0);

    chain.valid.should.be.true;

  });

  it('should increment errorCount', function () {

    chain.a.string();

    chain.testCount.should.equal(3);
    chain.errorCount.should.equal(1);
    chain.valid.should.be.false;

  });

  it('should create a new chain for a property', function () {

    var strChain = is('abc')
      , lengthChain = strChain.property('length')
    ;

    lengthChain.should.not.equal(strChain);
    lengthChain.should.be.an.instanceof(is.Chain);

    strChain.value.should.equal('abc');
    lengthChain.value.should.equal(3);

  });

  it('should validate values', function () {

    var testChain = is(123)
      .validate(function (val) {
        return val % 2 === 1;
      })
    ;

    testChain.valid.should.be.true;

    testChain.validate(function (val) {
      return val % 2 === 0;
    });

    testChain.valid.should.be.false;

  });

  it('should manipulate values', function () {

    var manipChain = is(123)
      .strictEqual(123)
      .manipulate(function (val) {
        return val * 2;
      })
      .strictEqual(246)
    ;

    manipChain.valid.should.be.true;
    manipChain.testCount.should.equal(2);
    manipChain.value.should.equal(246);

  });

  it('should not throw errors on a valid chain', function () {

    chain.clear();

    chain.a.number();

    chain.valid.should.be.true;

    (function () {
      chain.throwError();
    }).should.not.throw();

  });

  it('should throw an error on an invalid chain', function () {

    chain.a.string();

    chain.valid.should.not.be.true;
    (function () {
      chain.throwError();
    }).should.throw();

    chain.a.string();

    chain.clear();

    chain.valid.should.be.true;
    (function () {
      chain.throwError();
    }).should.not.throw();

  });

  it('should negate validation tests with `not`', function () {

    chain.clear();

    chain.a.string();

    chain.valid.should.be.false;

    chain.clear();

    chain.not.a.string();

    chain.valid.should.be.true;

  });

  it('should use `or` properly', function () {

    chain.clear();

    chain
      .a.string().or
      .a.number()
    ;

    chain.valid.should.be.true;
    chain.testCount.should.equal(2);

    chain.clear();

    chain
      .a.number().or
      .a.string().or
      .an.array().or
      .a.buffer()
    ;

    chain.valid.should.be.true;
    chain.testCount.should.equal(1);

    chain.clear();

    chain
      .a.string().or
      .an.array().or
      .a.buffer()
    ;

    chain.valid.should.be.false;
    chain.testCount.should.equal(3);
    chain.errorCount.should.equal(1);

    chain.errorMessage.should.equal('value must be a string, be an array, or be a buffer');

  });

  it('should stop testing when using `ifValid', function () {

    chain.clear();

    chain.a.number();

    chain.ifValid().greaterThan(100);

    chain.errorCount.should.equal(0);
    chain.testCount.should.equal(2);

    chain.clear();

    chain.a.string();

    chain.ifValid().greaterThan(100);

    chain.errorCount.should.equal(1);
    chain.testCount.should.equal(1);

  });

  it('should not throw when trying to access a property of undefind', function () {

    chain.clear();
    // var chain = is(123);

    chain
      .property('undefinedProperty')
      .property('subproperty')
      .greaterThan(100)
    ;

    chain.errorCount.should.equal(1);
    chain.testCount.should.equal(1);

  });

});
