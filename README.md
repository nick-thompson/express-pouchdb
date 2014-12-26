# express-pouchdb

[![Build Status](https://travis-ci.org/pouchdb/express-pouchdb.svg)](https://travis-ci.org/pouchdb/express-pouchdb)

> An Express submodule with a CouchDB style REST interface to PouchDB.

## Introduction

The **express-pouchdb** module is a fully qualified [Express](http://expressjs.com/) application with routing defined to 
mimic most of the [CouchDB](http://couchdb.apache.org/) REST API, and whose behavior is handled by 
[PouchDB](http://pouchdb.com/). The intention is for **express-pouchdb** to be mounted into other Express apps for 
extended usability. A simple example of this is [pouchdb-server](https://github.com/nick-thompson/pouchdb-server), 
which is primarily used as a quick-and-dirty drop-in replacement for CouchDB in Node.js.

## Screencasts

* [Modular web applications with Node.js and Express](http://vimeo.com/56166857)

## Installation

```bash
$ npm install express-pouchdb
```

## Example Usage

Here's a sample Express app, 

#### 1) Setup your app

```bash
npm install express-pouchdb express pouchdb morgan
```

#### 2) Write your app `app.js`.

```javascript
var express = require('express')
  , app     = express()
  , PouchDB = require('pouchdb')
  , logger  = require('morgan')
  ;

app.use(logger('tiny'));

// Load express-pouchdb server at /express-pouchdb
//   Fauxton Admin ui is at /express-pouchdb/_utils
app.use('/express-pouchdb', require('express-pouchdb')(PouchDB));

// The rest of your app is here
app.get('/', function(req, res, next) { 
  res.send('Welcome Traveler!  <a href="/express-pouchdb/_utils">Fauxton?</a>');
});

app.listen(3000);
```

#### 3) Run your app

Now we can run this little guy.

```bash
$ node app.js &
```

#### 4) And Test it

  - Your app: [http://localhost:3000/](http://localhost:3000/)
  - Pouchdb server API: [http://localhost:3000/express-pouchdb/](http://localhost:3000/express-pouchdb/)
  - Fauxton admin UI: [http://localhost:3000/express-pouchdb/_utils](http://localhost:3000/express-pouchdb/_utils)

To interact with the PouchDB API directly:

```bash
# Version info
curl http://localhost:3000/express-pouchdb
{"express-pouchdb":"Welcome!","version":"0.7.1"}

# List db's
curl http://localhost:3000/express-pouchdb/_all_dbs
["_replicator","_users"]

# Make a new db
curl -X PUT  http://localhost:3000/express-pouchdb/newdatabase
{"ok":true}
curl http://localhost:3000/express-pouchdb/_all_dbs
["_replicator","_users","newdatabase"]
```

*Note for Express 3.0,* **express-pouchdb** bundles its own JSON parsing middleware which conflicts with 
[`express.bodyParser()`](http://expressjs.com/api.html#bodyParser). Please avoid using `express.bodyParser()`. Rather,
you can use `express.urlencoded()` and `express.multipart()` alongside the **express-pouchdb** JSON middleware 
and you should find the results to be the same as you would have expected with `express.bodyParser()`.

```javascript
app.use(express.urlencoded());
app.use(express.multipart());
app.use(require('express-pouchdb')(require('pouchdb')));
```

### Using your own PouchDB

Since you pass in the `PouchDB` that you would like to use with express-pouchb, you can drop
express-pouchdb into an existing Node-based PouchDB application and get all the benefits of the HTTP interface without having to change your code.

```js
var express = require('express')
  , app     = express()
  , PouchDB = require('pouchdb');

app.use('/express-pouchdb', require('express-pouchdb')(PouchDB));

var myPouch = new PouchDB('foo');

// myPouch is now modifiable in your own code, and it's also
// available via HTTP at /express-pouchdb/foo
```

### PouchDB defaults

**Warning: this feature will be added in PouchDB 3.0.0. Use the PouchDB master branch if you can't wait.**

When you use your own PouchDB code in tandem with express-pouchdb, the `PouchDB.defaults()` API can be very convenient for specifying some default settings for how PouchDB databases are created.

For instance, if you want to use an in-memory [MemDOWN](https://github.com/rvagg/memdown)-backed pouch, you can simply do:

```js
var InMemPouchDB = PouchDB.defaults({db: require('memdown')});

app.use('/express-pouchdb', require('express-pouchdb')(InMemPouchDB));

var myPouch = new InMemPouchDB('foo');
```

Similarly, if you want to place all database files in a folder other than the `pwd`, you can do:

```js
var TempPouchDB = PouchDB.defaults({prefix: '/tmp/my-temp-pouch/'});

app.use('/express-pouchdb', require('express-pouchdb')(TempPouchDB));

var myPouch = new TempPouchDB('foo');
```

## Functionality

On top of the exposing everything PouchDB offers through a CouchDB-like
interface, **express-pouchdb** also offers the following extra
functionality found in CouchDB but not in PouchDB by default:

- [Authentication][] and [authorisation][] support. HTTP basic
  authentication and cookie authentication are available. Authorisation
  is handled by [validation functions][] and [security documents][].
- [Configuration][] support. You can modify configuration values
  manually in the `config.json` file, or use the HTTP or Fauxton
  interface.
- [Replicator database][] support. This allows your replications to
  persist past a restart of your application.
- Support for [show][], [list][] and [update][] functions. These allow
  you to serve non-json content straight from your database.
- [Rewrite][] and [Virtual Host][] support, for nicer urls.

[authentication]:       http://docs.couchdb.org/en/latest/intro/security.html
[authorisation]:        http://docs.couchdb.org/en/latest/intro/overview.html#security-and-validation
[validation functions]: http://docs.couchdb.org/en/latest/couchapp/ddocs.html#vdufun
[security documents]:   http://docs.couchdb.org/en/latest/api/database/security.html
[configuration]:        http://docs.couchdb.org/en/latest/config/intro.html#setting-parameters-via-the-http-api
[replicator database]:  http://docs.couchdb.org/en/latest/replication/replicator.html
[show]:                 http://guide.couchdb.org/editions/1/en/show.html
[list]:                 http://guide.couchdb.org/editions/1/en/transforming.html
[update]:               http://docs.couchdb.org/en/latest/couchapp/ddocs.html#update-functions
[rewrite]:              http://docs.couchdb.org/en/latest/api/ddoc/rewrites.html
[virtual host]:         http://docs.couchdb.org/en/latest/config/http.html#vhosts

## Contributing

Want to help me make this thing awesome? Great! Here's how you should get started.

1. Because PouchDB is still developing so rapidly, you'll want to clone `git@github.com:daleharvey/pouchdb.git`, and run `npm link` from the root folder of your clone.
2. Fork **express-pouchdb**, and clone it to your local machine.
3. From the root folder of your clone run `npm link pouchdb` to install PouchDB from your local repository from Step 1.
4. `npm install`

Please make your changes on a separate branch whose name reflects your changes, push them to your fork, and open a pull request!

For commit message style guidelines, please refer to [PouchDB CONTRIBUTING.md](https://github.com/pouchdb/pouchdb/blob/master/CONTRIBUTING.md).


## Testing

To test for regressions, the following comes in handy:
- the PouchDB test suite: ``npm run test-pouchdb``
- the jshint command: ``npm run jshint``
- the express-pouchdb test suite (for express-pouchdb specific things like its API only!): ``npm run test-express-pouchdb``

``npm test`` combines these three.

There is also the possibility to run express-pouchdb against a part of
the CouchDB test suite. For that, try: ``npm run test-couchdb``. If it
doesn't work, try using [couchdb-harness](https://github.com/nick-thompson/couchdb-harness),
which that command is based on, directly.

### Fauxton

The custom Fauxton theme, with the PouchDB Server name and logo, are kept [in a Fauxton fork](https://github.com/nolanlawson/couchdb-fauxton) for the time being.

While `express-pouchdb` can be loaded at other URL's in your application, the Fauxton admin app [may not work](https://github.com/pouchdb/express-pouchdb/issues/116).

```javascript
app.use('/some-other-url', require('express-pouchdb')(PouchDB));  // Yeay!  But no Fauxton
```

## Contributors

A huge thanks goes out to all of the following people for helping me get this to where it is now.

* Dale Harvey ([@daleharvey](https://github.com/daleharvey))
* Nolan Lawson ([@nolanlawson](https://github.com/nolanlawson)) 
* Ryan Ramage ([@ryanramage](https://github.com/ryanramage))
* Garren Smith ([@garrensmith](https://github.com/garrensmith))
* ([@copongcopong](https://github.com/copongcopong))
* ([@zevero](https://github.com/zevero))

## License

Copyright (c) 2013 Nick Thompson

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

