var Method = function(f,a) {
  this.handler = f;
  this.needsAuth = a;
  this.name = "Hello!";
};

module.exports = Method;
