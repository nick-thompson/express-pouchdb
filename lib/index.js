"use strict";

var utils            = require('./utils'),
    enableReplicator = require('./replicator'),
    enableValidation = require('./validation'),
    enableDiskSize   = require('./disk_size'),
    wrappers         = require('pouchdb-wrappers'),
    express          = require('express'),
    CouchConfig      = require('./couch_config'),
    DatabaseWrapper  = require('./db_wrapper'),
    CouchLogger      = require('./couch_logger');

function fullServer(PouchDB, opts) {
  var app = express();

  app.opts = opts || {};
  app.dbWrapper = new DatabaseWrapper();

  //config
  var path = app.opts.configPath || './config.json';
  app.couchConfig = new CouchConfig(path);

  // logging
  app.couchConfig.registerDefault('log', 'file', './log.txt');
  app.couchConfig.registerDefault('log', 'level', 'info');
  var getFile = app.couchConfig.get.bind(app.couchConfig, 'log', 'file');
  var getLevel = app.couchConfig.get.bind(app.couchConfig, 'log', 'level');
  app.couchLogger = new CouchLogger(getFile(), getLevel());
  app.couchConfig.on('log.file', function () {
    app.couchLogger.setFile(getFile());
  });
  app.couchConfig.on('log.level', function () {
    app.couchLogger.setLevel(getLevel());
  });

  // add PouchDB.new() - by default it just returns 'new PouchDB()'
  wrappers.installStaticWrapperMethods(PouchDB, {});
  require('pouchdb-all-dbs')(PouchDB);

  app.dbWrapper.registerWrapper(function (name, db, next) {
    //'fix' the PouchDB api (support opts arg everywhere)
    function noop(orig, args) {
      return orig();
    }
    // TODO: expand
    wrappers.installWrapperMethods(db, {info: noop});
    return next();
  });

  app.use(require('compression')());
  app.use(function (req, res, next) {
    var prop;

    // Normalize query string parameters for direct passing
    // into PouchDB queries.
    for (prop in req.query) {
      if (req.query.hasOwnProperty(prop)) {
        try {
          req.query[prop] = JSON.parse(req.query[prop]);
        } catch (e) {}
      }
    }
    next();
  });

  enableDiskSize(app, PouchDB);
  enableReplicator(app, PouchDB);

  // load the rules
  utils.loadRoutesIn([
    './routes/auth',
    './routes/vhosts',
    './routes/rewrite',
    './routes/http_log',
    './routes/root',
    './routes/log',
    './routes/session',
    './routes/fauxton',
    './routes/config',
    './routes/uuids',
    './routes/all_dbs',
    './routes/replicate',
    './routes/db',
    './routes/bulk_docs',
    './routes/all_docs',
    './routes/changes',
    './routes/compact',
    './routes/revs_diff',
    './routes/security',
    './routes/views',
    './routes/ddoc_info',
    './routes/show',
    './routes/list',
    './routes/update',
    './routes/attachments',
    './routes/documents'
  ], app, PouchDB);

  enableValidation(app, PouchDB);

  // 404 handler
  app.use(function (req, res, next) {
    utils.sendJSON(res, 404, {
      error: "not_found",
      reason: "missing"
    });
  });

  return app;
}

module.exports = fullServer;
