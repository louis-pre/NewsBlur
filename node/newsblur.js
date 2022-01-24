// Generated by CoffeeScript 2.6.1
(function() {
  var ENV_DEV, ENV_DOCKER, ENV_PROD, Sentry, Tracing, app, envresult, favicons, log, original_page, original_text, server, unread_counts;

  Sentry = require("@sentry/node");

  Tracing = require("@sentry/tracing");

  app = require('express')();

  server = require('http').createServer(app);

  log = require('./log.js');

  envresult = require('dotenv').config({
    path: 'node/.env'
  });

  if (envresult.error) {
    // throw envresult.error
    envresult = require('dotenv').config();
    if (envresult.error) {
      log.debug(" ---> No .env file found, using defaults");
    }
  }

  // throw envresult.error
  ENV_DEV = process.env.NODE_ENV === 'development';

  ENV_PROD = process.env.NODE_ENV === 'production';

  ENV_DOCKER = process.env.NODE_ENV === 'docker';

  original_page = require('./original_page.js').original_page;

  original_text = require('./original_text.js').original_text;

  favicons = require('./favicons.js').favicons;

  unread_counts = require('./unread_counts.js').unread_counts;

  if (!ENV_DEV && !ENV_PROD && !ENV_DOCKER) {
    throw new Error("Set envvar NODE_ENV=<development,docker,production>");
  }

  if (ENV_PROD) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      debug: true,
      tracesSampleRate: 1.0,
      serverName: process.env.SERVER_NAME
    });
    app.use(Sentry.Handlers.requestHandler());
  }

  original_page(app);

  original_text(app);

  favicons(app);

  unread_counts(server);

  if (ENV_PROD) {
    app.get("/debug", function(req, res) {
      throw new Error("Debugging Sentry");
    });
    app.use(Sentry.Handlers.errorHandler());
    log.debug(`Setting up Sentry debugging: ${process.env.SENTRY_DSN.substr(0, 20)}...`);
  }

  log.debug(`Starting NewsBlur Node Server: ${process.env.SERVER_NAME || 'localhost'}`);

  server.listen(8008);

}).call(this);
