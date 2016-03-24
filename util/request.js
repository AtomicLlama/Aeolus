var auth = require('basic-auth');
var url = require('url');

var Request = function(req,server) {
  this.req = req;
  this.server = server;
  this.auth = auth(req) || {};
  this.parameters = url.parse(req.url, true).query;
};

Request.prototype.getUsername = function() {
  return this.auth.name;
};

Request.prototype.getPassword = function() {
  return this.auth.pass;
};

Request.prototype.setParameter = function (name,data) {
  this.parameters[name] = data;
};

Request.prototype.getParameter = function(field) {
  if (field) {
    return this.parameters[field];
  }
  return this.parameters;
};

Request.prototype.getBody = function () {
  return this.req.body;
};

Request.prototype.getParameters = function () {
  return this.parameters;
};

Request.prototype.authenticate = function() {
  return this.server.authHandler(this.getUsername(),this.getPassword());
};

Request.prototype.getRequestObject = function() {
  return this.req;
};

module.exports = Request;
