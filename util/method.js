var functionForItem = function (item) {
  if (typeof item !== 'function') {
    return function (req) {
      return item;
    };
  }
  return item;
};

var dbErrorHandler = function(req, res, err) {
  res.respondPlainText("Internal Server Error " + err, 501);
};

var Method = function() {
  this.handler = function(req,res) {
    res.respondPlainText("This is a new Method!");
  };
  this.name = "";
  this.needsAuth = false;
  this.authHandler = false;
  this.errorHandler = false;
  this.DBWrapper.parent = this;
};

Method.prototype.handle = function (f) {
  this.handler = function (req, res) {
    try {
      f(req,res);
    } catch (err) {
      if (this.errorHandler) {
        errorHandler(req, res, err);
      } else {
        throw err;
      }
    }
  };
};

Method.prototype.auth = function (f) {
  this.authHandler = f;
  if (f) {
    this.needsAuth = true;
  }
};

Method.prototype.setHasAuth = function (b) {
  this.needsAuth = b;
};

Method.prototype.onError = function (err) {
  this.errorHandler = err;
};

Method.prototype.DBWrapper = {
  findAll: function (table, query, map, status, headers, error) {
    var DB = require('aeolus').DB;
    map = map || function (a) { return a; };
    table = functionForItem(table);
    query = functionForItem(query);
    error = error || this.parent.errorHandler || dbErrorHandler;
    this.parent.handle(function(req, res) {
      var t = table(req), q = query(req);
      DB.findAll(t, q, function(items) {
        res.respondJSON(items.map(map), status, headers);
      }, function(err) {
        error(req,res,err);
      });
    });
  },
  find: function (table, query, map, status, headers, error) {
    var DB = require('aeolus').DB;
    map = map || function (a) { return a; };
    table = functionForItem(table);
    query = functionForItem(query);
    error = error || this.parent.errorHandler || dbErrorHandler;
    this.parent.handle(function(req, res) {
      var t = table(req), q = query(req);
      DB.find(t, q, function(items) {
        res.respondJSON(map(items), status, headers);
      }, function(err) {
        error(req,res,err);
      });
    });
  },
  insert: function (table, query, status, headers, error) {
    var DB = require('aeolus').DB;
    table = functionForItem(table);
    query = functionForItem(query);
    error = error || this.parent.errorHandler || dbErrorHandler;
    this.parent.handle(function(req, res) {
      var t = table(req), q = query(req);
      DB.insert(t, q, function(already) {
        if (already)
          res.respondPlainText("Item was already in the DB", status, headers);
        else
          res.respondPlainText("Item succesfully added.", status, headers);
      }, function(err) {
        error(req,res,err);
      });
    });
  },
  edit: function (table, query, map, status, headers, error) {
    var DB = require('aeolus').DB;
    table = functionForItem(table);
    query = functionForItem(query);
    error = error || this.parent.errorHandler || dbErrorHandler;
    this.parent.handle(function(req, res) {
      var t = table(req), q = query(req);
      DB.edit(t, q, function() {
        res.respondPlainText("Items have been saved.");
      }, function(err) {
        error(req,res,err);
      });
    });
  },
  map: function (table, query, map, status, headers, error) {
    var DB = require('aeolus').DB;
    table = functionForItem(table);
    query = functionForItem(query);
    error = error || this.parent.errorHandler || dbErrorHandler;
    this.parent.handle(function(req, res) {
      var t = table(req), q = query(req);
      DB.map(t, q, function() {
        res.respondPlainText("Items have been saved.");
      }, function(err) {
        error(req,res,err);
      });
    });
  },
  reduce: function (table, query, reduce, initialValue, status, headers, error) {
    var DB = require('aeolus').DB;
    table = functionForItem(table);
    query = functionForItem(query);
    error = error || this.parent.errorHandler || dbErrorHandler;
    this.parent.handle(function(req, res) {
      var t = table(req), q = query(req);
      DB.reduce(t, q, reduce, initialValue,function() {
        res.respondPlainText("Items have been saved.");
      }, function(err) {
        error(req,res,err);
      });
    });
  },
  delete: function (table, query, status, headers, error) {
    var DB = require('aeolus').DB;
    table = functionForItem(table);
    query = functionForItem(query);
    error = error || this.parent.errorHandler || dbErrorHandler;
    this.parent.handle(function(req, res) {
      var t = table(req), q = query(req);
      DB.delete(t, q,function() {
        res.respondPlainText("Items has been deleted.");
      }, function(err) {
        error(req,res,err);
      });
    });
  }
};

module.exports = Method;
