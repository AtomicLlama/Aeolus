![alt text](https://raw.githubusercontent.com/AtomicLlama/Aeolus/master/aeolusgit.png "Logo Title Text 1")
---

Hello! This is Aeolus. The instant REST API by Atomic Llama.

Aeolus allows you to create a fast, simple and extendible REST API in seconds.

One of the key features of the framework is that it allows you to host a website and your REST API on the same server with the minimal amount of code.

**Table of Contents**

1. [Installing Aeolus](#installing-aeolus)
  - [Starting From Scratch](#starting-from-scratch)
  - [Add Aeolus to your current project](#add-aeolus-to-your-current-project)
2. [Starting it](#starting-it)
3. [More Options](#more-options)
4. [Having a public page](#having-a-public-page)
5. [Methods](#methods)
6. [Requests](#requests)
7. [Responses](#responses)
8. [Database Access](#database-access)

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

## Starting it

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

### Authentication

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

#### Authentication

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

#### Smart Methods and Nested URLs

Do you want special resources with more complicated URLs? Well that's pretty simple. Simple use a "." instead of a "/" in the filename and the URL will be nested.

For instance "methods/get/user.friends.js" handles GET requests to "/user/friends".

If your url needs a parameter that's simple too! Just write the parameter into the filename with "(name)" surrounding it. And that parameter will be available with request.getParameter(name).

For example if you have a get request for every user in your database and what everyone to have it's own url. Just create a method in "methods/get/user.(id).js". To get the id entered just write:

```javascript
var Method = require('Aeolus').Method;

var User = new Method();
User.handle(function(request, response) {
  var id = request.getParameter("id");
  response.respondPlainText("Hi, user " + id);
});

module.exports = User;
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

## Database Access

Aeolus brings out of the box an easy way to connect to MongoDB.

To give your API a fast access to your DB simply enter the connection url with:

```javascript
Aeolus.setDB('mongodb://username:password@dburl');
```

To use the url simply import it with:

```javascript
var DB = require('aeolus').DB;
```

### Finding an element

To find a single element in a table just call DB.find. For instance if you're looking for an user with the id: 1234 in your users table. Call it with the proper success and error handlers:

```javascript
DB.find('users', { id: 1234 }, function (user) {
  console.log("Success! Found user.");
  console.log(user);
}, function (err) {
  console.log("Some error ocurred!");
  console.error(err);
});
```

### Finding all elements

To find all the elements that match your criteria simply call DB.findAll just like you woult with find. But the success handler will be called with an Array of objects. For example if you want all the users with the id greater than 1000

```javascript
DB.findAll('users', { id: { $gt: 1000 } }, function (users) {
  console.log("Success! Found "  + users.length + " users.");
  console.log(users);
}, function (err) {
  console.log("Some error ocurred!");
  console.error(err);
});
```

### Edit an elements

To edit an element you can call DB.edit with the table, the query, a mapping function that will edit the object and the handlers. For example if you want to increase a counter on how many times a user visits your site:

```javascript
DB.edit('users', { id: 1234 }, function (user) {
  user.counter++;
  return user;
}, function () {
  console.log("Success.");
}, function (err) {
  console.log("Some error ocurred!");
  console.error(err);
});
```

### Map (Edit many)

Just like with DB.edit you can also edit many elements at the same time with DB.map. Using the exact same parameters. For instance if you want to reset all the counters from last example to 0.

```javascript
DB.map('users', { }, function (user) {
  user.counter = 0;
  return user;
}, function () {
  console.log("Success.");
}, function (err) {
  console.log("Some error ocurred!");
  console.error(err);
});
```

### Insert

To insert data to your DB there's a simple method called DB.insert.
Call it with the table, the object you want to insert and the handlers.

```javascript
var newUser = {
  id: 1234,
  name: "Bob the Llama"
};
DB.insert('users', newUser, function (already) {
  console.log("Success.");
  if (already) {
    console.log("Object was already there.");
  }
}, function (err) {
  console.log("Some error ocurred!");
  console.error(err);
});
```

### Delete

To delete any objects matching your query call DB.delete.
If for instance you want to delete all the users with the first name "Bob" for some reason:

```javascript
DB.delete('users', { firstName: "Bob" }, function () {
  console.log("Success.");
}, function (err) {
  console.log("Some error ocurred!");
  console.error(err);
});
```

### Reduce

Sometimes you don't need the objects themselves but rather a result using those object.
For that we have DB.reduce which takes a table, a object for the query, a reducing function as Array.reduce would, the initialValue and your success and error handlers.

For example if you want to count how many visits all the users named "Bob" have made to your site (if you keep track of it, obviously) you could:

```javascript
DB.map('users', { firstName: "Bob" }, function (result, user) {
  return result + user.visits;
}, 0, function (result) {
  console.log("Success. All the Bobs visited the site: " + result + " times.");
}, function (err) {
  console.log("Some error ocurred!");
  console.error(err);
});
```

More more information on the operations you can do in the queries consult the [MongoDB Reference](https://docs.mongodb.org/manual/reference/operator/query/)

### Methods as DB Wrappers

Methods can also be defined as predetermined operations on your Database.

To turn a Method into an operation simply call the function from YourMethod.DBWrapper.operation

This means that instead of writing a handler you write how the request to the database should look.

All the functions will take the regular parameters (e.g. the table and the query object and mapping functions if necessary) expect for the success handler, a function to determine what part of the result will be in the response (just for .find and .findAll) and optionally status and headers.

**Very Important:** The table and the query parameters can either be a function that takes the request object and returns the table of query for that request, or hardcoded variables.

For example if you want a **GET** on user.(id) to return the name of the user with the id. Create the Method like this:

```javascript
var Method = require('Aeolus').Method;

var User = new Method();
User.DBWrapper.find('users', function(request) {
  return {
    id: request.getParameter('id')
  };
}, function (user) {
  return user.name;
});

module.exports = User;
```

That method will take any request for user/(id) and return the name of that user in the Database. If it couldn't find it, it'll fire the error Handler.

So if there's a user:

```javascript
{
  id: 1234,
  name: "Bob The Llama"
}
```

A **GET** Request at user/1234 will return the String "Bob the Llama".


We hope you have a lot of fun using our framework. For any issues of changes don't hesitate to check out the GitHub Repo and either open an Issue or make the change yourself. :D

Aeolus is an Open Source Project so please feel free to use it however you like.

Built with **♥** by Atomic Llama
