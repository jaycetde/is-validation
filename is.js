'use strict';

var validators = require('./validators');

var Is = function () {
  this.clear();
};

var Chain = function (parent, val, name) {
  
  this._parent = parent;
  this._val = val;
  this._name = name;

  return this;

};

Chain.prototype.prop = function (prop, name) {
  var p = new Chain(this._parent, this._val[prop], name || this._name + ' ' + prop);
  p._up = this;
  return p;
};
Chain.prototype.up = function () {
  return this._up;
};

var that = function (val, name) {
  if (!(this instanceof Is)) {
    throw new Error('Not an instance');
  }

  return new Chain(this, val, name);

};

Is.prototype.that = that;
Is.prototype.addTest = function (name, fn) {
  Is.prototype[name] = function () {
    if (typeof(fn.apply(null, arguments)) === "string") {
      return false;
    }
    return true;
  };
  Chain.prototype[name] = function () {
    var args = Array.prototype.slice.call(arguments)
      , response = fn.apply(null, [this._val].concat(args));
    if (typeof(response) === "string") {
      this._parent.addError(this._name, response);
    }
    return this;
  };
};
Is.prototype.addError = function (name, message) {
  if (!this._errors[name]) {
    this._errors[name] = [];
  }
  if (this._errors[name].indexOf(message) === -1) {
    this._failures += 1;
    this._errors[name].push(message);
  }
};
Is.prototype.errors = function () {
  return this._errors;
};
Is.prototype.failures = function () {
  return this._failures;
};
Is.prototype.clear = function () {
  this._errors = {};
  this._failures = 0;
  return this;
};
Is.prototype.valid = function () {
  return this._failures === 0;
};
Is.prototype.raise = function () {
  var errors = this._errors;
  if (this._failures > 0) {
    this.clear();
    throw errors;
  }
};
Is.prototype.create = function () {
  return new Is();
};

var hey = module.exports = new Is();


for (var name in validators) {
  if (validators.hasOwnProperty(name)) {
    hey.addTest(name, validators[name]);
  }
}
