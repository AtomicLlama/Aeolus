var http = require('http');
var dispatcher = require('httpdispatcher');
var auth = require('basic-auth');
var fs = require('fs');

var Aeolus = function() {
  this.methodPath = "../methods/";
  this.publicPath = "../www/";
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

  var creator = function(resouce) {
    return function(req,r) {
        var res = new Response(r);
        if (this.authHandler !== null && resouce.needsAuth) {
          var authData = auth(req);
          if (authData) {
            if (this.authHandler(authData.name,authData.pass)) {
              resouce.handler(req,res,authData.name,authData.pass);
            } else {
              unauthorised(req,res);
            }
          } else {
            unauthorised(req,res);
          }
      } else {
        resouce.handler(req,res);
      }
    };
  };

  for (var i = 0; i < methods.length; i++) {
    var name = methods[i].name;
    var resources = methods[i].resources;
    dispatcher.listeners[name] = [];
    for (var j = 0; j < resources.length; j++) {
      var resouce = resouces[i];
      var handler = creator(resouce);
      dispatcher.on(name,'/' + resouce.name, handler);
    }
  }

  http.createServer(function (request, response) {
    getWebFile(request,response,dispatcher.dispatch,this.publicPath,error);
  }).listen(port);

};

module.exports = new Aeolus();
