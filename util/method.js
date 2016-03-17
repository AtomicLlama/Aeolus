var Method = function() {
  this.handler = function(req,res) {
    res.respondPlainText("This is a new Method!");
  };
  this.name = "";
  this.needsAuth = false;
  this.authHandler = false;
};

Method.prototype.handle = function (f) {
  this.handler = f;
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

module.exports = Method;
