var fs = require('fs');
var path = require('path');

function resourcesForDir(dir,pathToMethods) {
  var directoryPath = path.join(process.cwd(), pathToMethods + "/" + dir);
  var items = fs.readdirSync(directoryPath).filter(function(file) {
    var fileComponents = file.split(".");
    var extension = fileComponents[fileComponents.length-1];
    return extension === "js";
  });
  return items.map(function(file) {
    var filename = path.join(process.cwd(), pathToMethods + "/" + dir + "/" + file);
    var method = require(filename);
    var name = file.split(".")[0];
    return {
      needsAuth: method.needsAuth,
      handler: method.handler,
      name: name
    };
  });
}

function getMethods(pathToMethods) {
  var directoryPath = path.join(process.cwd(), pathToMethods);
  var directories = fs.readdirSync(directoryPath).filter(function(file) {
    var filename = path.join(process.cwd(), pathToMethods + "/" + file);
    return fs.statSync(filename).isDirectory();
  });
  return directories.map(function(dir) {
    return {
      name: dir,
      resources: resourcesForDir(dir,pathToMethods)
    };
  });

}

module.exports = getMethods;
