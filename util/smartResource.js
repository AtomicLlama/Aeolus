var URLPart = function(name,isParameter) {
  this.name = name;
  this.isParameter = isParameter || false;
};

URLPart.prototype.works = function(part) {
  if (!this.isParameter) {
    var actualPart = part.split("?").filter(function(p) { return p !== '';})[0];
    return this.name === actualPart;
  }
  return true;
};

var SmartResource = function(url, action, f) {
  this.action = action;
  this.method = f;
  this.needsAuth = f.needsAuth;
  this.authHandler = f.authHandler;
  this.parts = url.split("/").map(function(part) {
    if (part.indexOf("(") < 0) {
      return new URLPart(part,false);
    } else {
      return new URLPart(part.substring(1,part.length - 1),true);
    }
  });
};

SmartResource.prototype.works = function(url,action) {
  if (action !== this.action) return false;
  var parts = url.split("/").filter(function(p) { return p !== '';});
  try {
    for (var i = 0; i < this.parts.length; i++) {
      if (!this.parts[i].works(parts[i])) {
        return false;
      }
    }
  } catch(e) {
    return false;
  }
  return true;
};

SmartResource.prototype.getParameters = function(url)  {
  var parameters = [];
  var parts = url.split("/").filter(function(p) { return p !== '';});
  for (var i = 0; i < this.parts.length; i++) {
    if (this.parts[i].isParameter && parts[i]) {
      parameters.push({
        name: this.parts[i].name,
        data: parts[i].split("?")[0]
      });
    }
  }
  return parameters;
};

SmartResource.prototype.handler = function(req,res) {
  var url = req.getRequestObject().url;
  var parameters= this.getParameters(url);
  for (var i = 0; i < parameters.length; i++) {
    req.setParameter(parameters[i].name,parameters[i].data);
  }
  this.method.handler(req,res);
};

module.exports = SmartResource;
