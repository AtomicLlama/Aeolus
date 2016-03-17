![alt text](https://raw.githubusercontent.com/AtomicLlama/Aeolus/master/aeolusgit.png "Logo Title Text 1")
---

Hello! This is Aeolus. The instant REST API by Atomic Llama.

Aeolus allows you to create a fast, simple and extendible REST API in seconds.

One of the key features of the framework is that it allows you to how a website and your REST API on the same server with the minimal amount of code.

## Installing Aeolus

Aeolus works with node and you can use it to start from scratch or compliment your current project.

### Starting From Scratch

To create a new project with Aeolus you will need Node and npm installed http://nodejs.org and https://www.npmjs.com

Once done with that. You can install Aeolus from the terminal.

```
$ npm install aeolus -g
```

To create your project you can navigate to the folder where you want it (or create one) and run our wizard with

```
$ aeolus
```

Simply follow the steps and you will have a whole project already in front of you!

### Add Aeolus to your current project

Perhaps you already know a bit about Node and don't need our wizard.

Simply run:

```
$ npm install aeolus --save
```

And our Framework will be already installed for you to use.

## Staring it

To use kickstart Aeolus you simply have to call the function createServer with the port number you want it to listen to.

We recommend having this code:

```javascript
var Aeolus = require('Aeolus');

var port = process.env.PORT || 8080;

Aeolus.createServer(port);
```

## More Options

### Other folders

Aeolus will by default listen to the "/methods" and "/www" folders for your API and public page. But you can give Aeolus another path to listen to instead with the functions .methods and .www. For Example:


```javascript
Aeolus.methods("/api");  // API Methods are now in the /api folder
Aeolus.methods("/html"); // Web page is now in the /html folder
```

### Authentification

You can tell Aeolus how authentication works in your site by providing an authentication function.
This function would take a username and a password and return if it's valid or not. So that all methods marked as needing Authentication will prompt the user for a password.

You can enter this function by calling auth. For Example:

```javascript
var Aeolus.auth(function(name,pass) {
  return name === "root" && pass === "alpine";
});
```

### Error handling

One of the many features of the Framework is that you can also specify what will happen when there are any errors, when catching exceptions, handling resources that couldn't be found, etc.

Aeolus provides two important error handlers:

The .onError handler that will be fired up when there Aeolus couldn't find what the user was looking for or an internal error occurred and .unauthorised that will be called when a user tried to access something without authorisation. For example:

```javascript
var Aeolus.onError(function(request,response,message) {
  if (message == "TypeError: ") {
    response.respondPlainText("Internal Error",501);
  } else {
    response.redirect("/404");
  }
});
```
