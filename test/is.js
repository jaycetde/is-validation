var is = require('..')
  , should = require('should')
;

describe('is', function () {
    
    describe('Configuration', function () {
        
        it('should accept new validation methods', function () {
            
            is.configure.addValidator('even', function (val) {
                return val % 2 === 0;
            });
            
            is.should.have.property('even');
            is.Chain.prototype.should.have.property('even');
            
            is.even(2).should.be.true;
            
        });
        
        it('should accept new manipulation methods', function () {
            
            is.configure.addManipulator('squared', function (val) {
                return Math.pow(val, 2);
            });
            
            is.should.have.property('squared');
            is.Chain.prototype.should.have.property('squared');
            
            is.squared(5).should.equal(25);
            
        });
        
        it('should register chains', function () {
            
            is.clear();
            
            is._registered.should.be.empty;
            
            is(123).a.number();
            
            is._registered.should.not.be.empty;
            
        });
        
        it('should clear all registered chains', function () {
            
            is('abc').a.string();
            is(123).a.number();
            
            is.clear();
            
            is._registered.should.be.empty;
            
        });
        
        it('should not throw an exception if all registered chains are valid', function () {
            
            is.clear();
            
            is('abc').a.string();
            
            is.throwErrors.should.not.throw();
            
        });
        
        it('should throw an exception if any registered chain is invalid', function () {
            
            is.clear();
            
            is('abc').a.number();
            
            is.throwErrors.should.throw();
            
        });
        
        it('should have multiple error messages with multiple invalid chains', function () {
            
            is.clear();
            
            is(123).a.string();
            is('abc').a.number();
            
            is.testCount.should.equal(2);
            is.errorCount.should.equal(2);
            is.valid.should.be.false;
            is.errorMessages.length.should.equal(2);
            
        });
        
        it('should throw an exception if trying to add a new validator with the same name as another property', function () {
            
            var oldString = is.string;
            
            (function () {
                is.configure.addValidator('string', function () {});
            }).should.throw();
            
            (function () {
                is.configure.addManipulator('and', function () {});
            }).should.throw();
            
            (function () {
                is.configure.addValidator('errorMessages', function () {});
            }).should.throw();
            
            is.string.should.equal(oldString);
            
        });
        
    });
    
});