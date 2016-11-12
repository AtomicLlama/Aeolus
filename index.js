var http = require('http');
var HttpDispatcher = require('httpdispatcher');
var dispatcher = new HttpDispatcher();
var auth = require('basic-auth');
var fs = require('fs');
var path = require('path');

var Aeolus = function() {
  this.smartMethods = [];
  this.errorHandler = function(req,res) {
    res.respondPlainText("Aeolus Couln't find the resource you're looking for", 404);
  };
  this.authHandler = null;
  this.unauthorisedHandler = null;
  this.DB = null;
  var filename = path.join(process.cwd(), 'package.json');
  var file = fs.readFileSync(filename);
  var data = JSON.parse(file);
  if (data.aeolus && data.aeolus.paths) {
    this.methodPath = data.aeolus.paths.methods || "/methods";
    this.publicPath = data.aeolus.paths.web || "/www";
  } else {
    this.methodPath = "/methods";
    this.publicPath = "/www";
  }
};

Aeolus.prototype.setDB = function (url) {
  var DB = require('./util/DB.js');
  this.DB = new DB(url);
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

Aeolus.prototype.load = function () {
  var SmartResource = require('./util/smartResource.js');
  var getMethods = require('./util/getMethods.js');
  var methods = getMethods(this.methodPath);

  for (var i = 0; i < methods.length; i++) {
    var name = methods[i].name;
    var resources = methods[i].resources;
    dispatcher.listeners[name] = [];
    for (var j = 0; j < resources.length; j++) {
      var resource = resources[j];
      if (resource.name.indexOf("(") >= 0) {
        this.smartMethods.push(new SmartResource(resource.name,name,resource));
      } else {
        var handler = this.functionForResource(resource);
        dispatcher.on(name,'/' + resource.name, handler);
      }
    }
  }

  var smartMethods = this.smartMethods;
  var error = this.errorHandler;
  var aeolus = this;

  dispatcher.onError(function(req,res) {
    var Response = require('./util/response.js');
    var Request = require('./util/request.js');
    var urlString = req.url;
    var action = req.method.toLowerCase();
    var methodsThatWork = smartMethods.filter(function(m) {
      return m.works(urlString,action);
    });
    if (methodsThatWork.length > 0) {
      var f = aeolus.functionForResource(methodsThatWork[0]);
      f(req,res);
    } else {
      error(new Request(req),new Response(res));
    }
	});

};

Aeolus.prototype.functionForResource = function (resource) {
  var Response = require('./util/response.js');
  var Request = require('./util/request.js');
  var auther = this.authHandler;
  var unauth = this.unauthorisedHandler;
  var unauthorised = function(req,res) {
    if (unauth !== null) {
      unauth(req,res);
    } else {
      res.promptPassword("Please enter a Password");
    }
  };
  return function(re,r) {
      var res = new Response(r);
      var req = new Request(re,this);
      if (resource.authHandler || (auther !== null && resource.needsAuth)) {
        var authData = auth(req);
        if (authData) {
          if (resource.authHandler) {
            resource.authHandler(authData.name,authData.pass,function(valid) {
              if (valid) {
                resource.handler(req,res);
              } else {
                unauthorised(req,res);
              }
            });
          } else {
            auther(authData.name,authData.pass,function(valid) {
              if (valid) {
                resource.handler(req,res);
              } else {
                unauthorised(req,res);
              }
            });
          }
        } else {
          unauthorised(req,res);
        }
    } else {
      resource.handler(req,res);
    }
  };
};

Aeolus.prototype.Method = require('./util/method.js');

Aeolus.prototype.Response = require('./util/response.js');

Aeolus.prototype.Request = require('./util/request.js');

Aeolus.prototype.createServer = function(port,options) {

  // Reading special options

  if (options) {
    if (options.methods) this.methods(options.methods);
    if (options.www) this.www(options.www);
    if (options.auth) this.auth(options.auth);
    if (options.unauthorised) this.unauthorised(options.unauthorised);
    if (options.onError) this.onError(options.onError);
  }

  this.load();

  var error = this.errorHandler;
  var publicPath = this.publicPath;
  var methodPath = path.join(process.cwd(), this.methodPath);

  var getWebFile = require('./util/getWebFile.js');

  var dispatch = function(req,res) {
    dispatcher.dispatch(req,res);
  };

  http.createServer(function (request, response) {
    getWebFile(request, response, dispatch, publicPath, error);
  }).listen(port);

  var aeolus = this;

  options = {
    persistent: true,
    recursive: true
  };
  fs.watch(methodPath, options, function(event, filename) {
    var parts = filename.split(".");
    if (parts[parts.length-1] === "js") {
      aeolus.load();
    }
  });

};

module.exports = new Aeolus();
