![alt text](https://raw.githubusercontent.com/AtomicLlama/Aeolus/master/aeolusgit.png "Logo Title Text 1")
---

Hello! This is Aeolus. The instant REST API by Atomic Llama.

Aeolus allows you to create a fast, simple and extendible REST API in seconds.

One of the key features of the framework is that it allows you to host a website and your REST API on the same server with the minimal amount of code.

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
This function would take a username and a password and callback a function with a boolean value (representing if the auth info is valid). So that all methods marked as needing Authentication will prompt the user for a password.

You can enter this function by calling auth. For Example:

```javascript
Aeolus.auth(function(name,pass,callback) {
  var valid = name === "root" && pass === "alpine";
  callback(valid);
});
```

### Error handling

One of the many features of the Framework is that you can also specify what will happen when there are any errors, when catching exceptions, handling resources that couldn't be found, etc.

Aeolus provides two important error handlers:

The .onError handler that will be fired up when there Aeolus couldn't find what the user was looking for or an internal error occurred and .unauthorised that will be called when a user tried to access something without authorisation. For example:

```javascript
Aeolus.onError(function(request,response,message) {
  if (message.indexOf("TypeError") >= 0) {
    response.respondPlainText("Internal Error",501);
  } else {
    response.redirect("/404");
  }
});
```

And the .unauthorised handler that gets called when the auth information entered by the user is incorrect!

```javascript
Aeolus.unauthorised(function(request,response) {
  response.promptForPassword("Please enter a password");
});
```

## Having a public page

One of the great things about Aeolus is that it allows you to create an API and at the same time serve your own webpage!

Aeolus will by default make anything inside the "/www" folder public. So basically every single document inside the "/www" folder will have it's own url.

You can obviously change the path of the folder with the function:

```javascript
Aeolus.www('/path/to/new/folder');
```

## Methods

Methods are the key to your REST API!
You will have to create a Method Object in it's own file for every action available in your API.

The key is understanding the file structure and how to create your objects.

### The File Structure

In your methods folder you will have a subfolder for every type of action. **(GET, POST, PUT, DELETE)**
Inside those folders will be a file for every url you are responding to. 
**It's important to note that the file names will be used as their urls and they are case sensitive**

For instance if your API only listens for a **GET** at "/hello": You have to create a file "hello.js" inside "/methods/get".

### Creating The Method

The big question is what should the file look like. Take this simple HelloWorld example:

```javascript
var Method = require('Aeolus').Method;

var HelloWorld = new Method();
HelloWorld.handle(function(request, response) {
  response.respondPlainText("Hello World!");
});

module.exports = HelloWorld;
```

### Options

#### Authentification

##### Asking For Authentication

If your method requires authentication simply call the .setHasAuth function. For Example with the HelloWorld Method:

```javascript
HelloWorld.setHasAuth(true);
```

This makes it so that if the Method get's called, the global Authentication Handler will be called first. If it doesn't clear up, the method won't even be called.

##### Special Authentication Handler

Sometimes you need different Authentication handlers for different Methods. No problem!
You can add special handler that will only be called with that method by calling the function .auth. For example if the HelloWorld method only works for the user "root":

```javascript
HelloWorld.auth(function(name, pass, callback) {
  callback(name === "root" && pass === "alpine");
});
```

## Requests

All your methods get called with a special Request object. Here is what you can do with it:

### Get Authentication Data

If you need to access that info from the method you can at all times get them directly:

```javascript
var username = request.getUsername();
var password = request.getPassword();
``` 

### Get Parameters

You can get any parameter that may be embedded into the url.

```javascript
var query = request.getParameter('query');
```

### Get the body of the Message

To get the body of the message (Should only be used for POST) there's the .getBody function

```javascript
var data = request.getBody();
```

### Get the original request Object

For those who know Node better, you can also directly handle the regular http response object:

```javascript
var req = request.getRequestObject();
```

## Responses

Just like with the Requests, you also get special Response objects with their only simplifications.

### Respond

There are many ways you can quickly respond. Status and headers are always optional and the defaults will be used if you don't specify them.

#### JSON

```javascript
var myObject = {
  name: "My Object",
  id: 42
};
response.respondJSON(myObject);
```

Or if you want to include more information like the header:

```javascript
var headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
};
response.respondJSON(myObject, 201, headers);
```

#### Plain Text

The same goes for when responding only with text:

```javascript
response.respondPlainText("This is my response: 42");
```

#### A File

Simply call the function with the path to the file. You are not allowed to put your own headers on this one.

```javascript
response.respondFile("path/to/file.ext");
```

### Prompt for password

If you think the user forgot to put the auth info on there request you can prompt them again:

```javascript
response.promptPassword("Please Enter a Password");
```

### Redirect the user to somewhere else

You can also simply redirect the user to another place with, for example:

```javascript
response.redirect("http://www.google.com");
```

### Get The Original Object

We can also give you the regular response object that if you need something more tailored or down at the metal.

```javascript
var res = response.getResponseObject();
```

Built with **♥** by Atomic Llama