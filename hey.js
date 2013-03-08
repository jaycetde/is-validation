'use strict';

var Hey = function () {
  this.clear();
};

var Chain = function (parent, val, name) {
  
  this._parent = parent;
  this._val = val;
  this._name = name;

  return this;

};

var is = function (val, name) {
  if (!(this instanceof Hey)) {
    throw new Error('Not an instance');
  }

  return new Chain(this, val, name);

};

Hey.prototype.is = is;
Hey.prototype.addTest = function (name, fn) {
  Hey.prototype[name] = function () {
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
Hey.prototype.addError = function (name, message) {
  if (!this._errors[name]) {
    this._errors[name] = [];
  }
  if (this._errors[name].indexOf(message) === -1) {
    this._failures += 1;
    this._errors[name].push(message);
  }
};
Hey.prototype.errors = function () {
  return this._errors;
};
Hey.prototype.clear = function () {
  this._errors = {};
  this._failures = 0;
  return this;
};
Hey.prototype.valid = function () {
  return this._failures === 0;
};
Hey.prototype.raise = function () {
  var errors = this._errors;
  if (this._failures > 0) {
    this.clear();
    throw errors;
  }
};
Hey.prototype.create = function () {
  return new Hey();
};

var hey = module.exports = new Hey();

var builtIns = {
  'lt': function (val, limit) {
    if (!(val < limit)) {
      return 'less than ' + limit;
    }
  },
  'gt': function (val, limit) {
    if (!(val > limit)) {
      return 'greater than ' + limit;
    }
  }
};

for (var prop in builtIns) {
  if (builtIns.hasOwnProperty(prop)) {
    hey.addTest(prop, builtIns[prop]);
  }
}
