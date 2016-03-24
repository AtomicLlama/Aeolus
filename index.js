var http = require('http');
var dispatcher = require('httpdispatcher');
var auth = require('basic-auth');
var fs = require('fs');
var path = require('path');

var Aeolus = function() {
  this.methodPath = "/methods";
  this.publicPath = "/www";
  this.smartMethods = [];
  this.errorHandler = function(req,res) {
    res.respondPlainText("Aeolus Couln't find the resource you're looking for", 404);
  };
  this.opens = false;
  this.authHandler = null;
  this.unauthorisedHandler = null;
  var filename = path.join(process.cwd(), 'package.json');
  var file = fs.readFileSync(filename);
  var data = JSON.parse(file);
  if (data.aeolus && data.aeolus.paths) {
    this.methodPath = data.aeolus.paths.methods || "/methods";
    this.publicPath = data.aeolus.paths.web || "/www";
  }
};

Aeolus.prototype.setOpens = function(b) {
  this.opens = b;
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

  var getWebFile = require('./util/getWebFile.js');
  var getMethods = require('./util/getMethods.js');
  
  var Response = require('./util/response.js');
  var Request = require('./util/request.js');
  var SmartResource = require('./util/smartResource.js');

  var methods = getMethods(this.methodPath);

  var unauth = this.unauthorisedHandler;
  var error = this.errorHandler;

  var unauthorised = function(req,res) {
    if (unauth !== null) {
      unauth(req,res);
    } else {
      res.promptPassword("Please enter a Password");
    }
  };

  var auther = this.authHandler;

  var creator = function(resource) {
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

  for (var i = 0; i < methods.length; i++) {
    var name = methods[i].name;
    var resources = methods[i].resources;
    dispatcher.listeners[name] = [];
    for (var j = 0; j < resources.length; j++) {
      var resource = resources[j];
      if (resource.name.indexOf("(") >= 0) {
        this.smartMethods.push(new SmartResource(resource.name,name,resource));
      } else {
        var handler = creator(resource);
        dispatcher.on(name,'/' + resource.name, handler);
      }
    }
  }

  var dispatch = function(req,res) {
    dispatcher.dispatch(req,res);
  };

  var smartMethods = this.smartMethods;

  dispatcher.onError(function(req,res) {
    var urlString = req.url;
    var action = req.method.toLowerCase();
    var methodsThatWork = smartMethods.filter(function(m) {
      return m.works(urlString,action);
    });
    if (methodsThatWork.length > 0) {
      var f = creator(methodsThatWork[0]);
      f(req,res);
    } else {
      error(new Request(req),new Response(res));
    }
	});

  var publicPath = this.publicPath;
  http.createServer(function (request, response) {
    getWebFile(request, response, dispatch, publicPath, error);
  }).listen(port);

  if (this.opens) {
    var spawn = require('child_process').spawn;
    spawn('open', ['http://localhost:' + port + "/"]);
  }

};

module.exports = new Aeolus();
