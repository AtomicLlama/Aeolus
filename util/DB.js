var MongoClient = require('mongodb').MongoClient;
var isEmpty = require('./isEmpty.js');

var regularError = function(err) {
  throw err;
};

var DB = function(url) {
  this.url = url;
};

DB.prototype.find = function (table, query, success, error) {
  error = error || regularError;
  MongoClient.connect(this.url, function(err, db) {
    db.collection(table).findOne(query, function(err, doc) {
      db.close();
      if (isEmpty(doc) || doc === null || err !== null) {
        error(err);
      } else {
        success(doc);
      }
    });
  });
};

DB.prototype.findAll = function (table, query, success, error) {
  error = error || regularError;
  MongoClient.connect(this.url, function(err, db) {
    db.collection(table).find(query).toArray(function(err, doc) {
      db.close();
      if (isEmpty(doc) || doc === null || err !== null) {
        if (err !== null) {
          error(err);
        } else {
          success([]);
        }
      } else {
        success(doc);
      }
    });
  });
};

DB.prototype.edit = function (table, query, map, success, error) {
  error = error || regularError;
  var url = this.url;
  this.find(table, query, function (item) {
    MongoClient.connect(url, function(err, db) {
      if (err && err !== null) {
        error(err);
        db.close();
        return;
      }
      db.collection(table).save(map(item));
      db.close();
      callback(map(item));
    });
  }, error);
};

DB.prototype.insert = function (table, query, success, error) {
  error = error || regularError;
  MongoClient.connect(this.url, function(err, db) {
    db.collection(table).findOne(query, function(error, doc) {
      if (isEmpty(doc) || doc === null || err !== null) {
        db.collection(table).insertOne(query, function(errorInserting, result) {
          db.close();
          if (errorInserting !== null) {
            error(errorInserting);
          } else {
            success(false);
          }
        });
      } else {
        db.close();
        success(true);
      }
    });
  });
};

DB.prototype.delete = function(table, query, success, error) {
  error = error || regularError;
  MongoClient.connect(this.url, function(err, db) {
    db.collection(table).deleteMany(query, function(err, results) {
      db.close();
      if (err !== null) {
        error(err);
      } else {
        success();
      }
    });
  });
};

DB.prototype.map = function (table, query, map, success, error) {
  error = error || regularError;
  var url = this.url;
  this.findAll(table, query, function (items) {
    var count = 0;
    var doit = function(item) {
      MongoClient.connect(url, function(err, db) {
        if (err && err !== null) {
          error(err);
          db.close();
          return;
        }
        db.collection(table).save(map(item));
        db.close();
        count++;
        if (count === items.length) {
          success();
        }
      });
    };
    for (var i = 0; i < items.length; i++) {
      doit(items[i]);
    }
  }, error);
};

DB.prototype.reduce = function (table, query, reduce, initialValue, success, error) {
  error = error || regularError;
  this.findAll(table, query, function (items) {
    var result = items.reduce(reduce, initialValue);
    success(result);
  }, error);
};

module.exports = DB;
