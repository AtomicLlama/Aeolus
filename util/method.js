var Method = function(f,a) {
  this.handler = f;
  this.needsAuth = a;
};

module.exports = Method;
