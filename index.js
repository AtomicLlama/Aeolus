var http = require('http');
var dispatcher = require('httpdispatcher');
var auth = require('basic-auth');
var fs = require('fs');
var Method = require('./util/method.js');

var Aeolus = function() {
  this.methodPath = "/methods";
  this.publicPath = "/www";
  this.errorHandler = function(err) {
    throw err;
  };
  this.authHandler = null;
  this.unauthorisedHandler = null;
};

Aeolus.prototype.onError = function(f) {
  this.errorHandler = f;
};

Aeolus.prototype.auth = function(f) {
  this.authHandler = f;
};

Aeolus.prototype.unautharised = function(f) {
  this.usageErrorHandler = f;
};

Aeolus.prototype.methods = function(path) {
  this.methodPath = path;
};

Aeolus.prototype.www = function(path) {
  this.publicPath = path;
};

Aeolus.prototype.Method = function() {
  return Method;
};

Aeolus.prototype.createServer = function(port,options) {
  if (options) {
    if (options.methods) this.methods(options.methods);
    if (options.www) this.www(options.www);
    if (options.auth) this.auth(options.auth);
    if (options.unauthorised) this.unauthorised(options.unauthorised);
    if (options.onError) this.onError(options.onError);
  }

  var getWebFile = require('./util/getWebFile.js');
  var getMethods = require('./util/getMethods.js');
  var Response = require('./util/response.js');
  var methods = getMethods(this.methodPath);

  var unauthorised = function(req,res) {
    if (this.unauthorisedHandler !== null) {
      this.unauthorisedHandler(req,res);
    } else {
      this.errorHandler(req,res);
    }
  };

  var creator = function(resource) {
    return function(req,r) {
        console.log("request here!");
        var res = new Response(r);
        if (this.authHandler !== null && resource.needsAuth) {
          var authData = auth(req);
          if (authData) {
            if (this.authHandler(authData.name,authData.pass)) {
              resource.handler(req,res,authData.name,authData.pass);
            } else {
              unauthorised(req,res);
            }
          } else {
            unauthorised(req,res);
          }
      } else {
        resource.handler(req,res);
      }
    };
  };

  for (var i = 0; i < methods.length; i++) {
    var name = methods[i].name;
    var resources = methods[i].resources;
    dispatcher.listeners[name] = [];
    for (var j = 0; j < resources.length; j++) {
      var resource = resources[i];
      var handler = creator(resource);
      dispatcher.on(name,'/' + resource.name, handler);
    }
  }

  var dispatch = function(req,res) {
    dispatcher.dispatch(req,res);
  };

  http.createServer(function (request, response) {
    getWebFile(request,response,dispatch,this.publicPath,this.errorHandler);
  }).listen(port);

};

module.exports = new Aeolus();
