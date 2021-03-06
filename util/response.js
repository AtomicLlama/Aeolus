var fs = require('fs');
var path = require('path');

var Response = function(res) {
  this.res = res;
};

Response.prototype.respondJSON = function(object, status, headers) {
  var h = headers || {};
  h['Content-Type'] = 'application/json';
  this.res.writeHead(status || 200, h);
  this.res.end(JSON.stringify(object,0,4));
};

Response.prototype.respondFile = function (filename, status) {
  filename = path.join(process.cwd(), filename);
  var res = this.res;
  fs.readFile(filename, "binary", function(err, file) {
    if(err) {
      throw err;
    } else {
      res.writeHead(status || 200);
      res.write(file, "binary");
      res.end();
    }
  });
};

Response.prototype.respondPlainText = function(text, status, headers) {
  var h = headers || {};
  h['Content-Type'] = 'text/plain';
  this.res.writeHead(status || 200, h);
  this.res.end(text);
};

Response.prototype.promptPassword = function(text,headers) {
  var h = headers || {};
  h["WWW-Authenticate"] = 'Basic realm="Server"';
  this.respondPlainText(text,401,h);
};

Response.prototype.redirect = function(url, headers) {
  var h = headers || {};
  h.Location = url;
  this.respondPlainText("Redirecting",302,h);
};

Response.prototype.getResponseObject = function() {
  return this.res;
};

module.exports = Response;
