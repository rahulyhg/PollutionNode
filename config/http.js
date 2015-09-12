/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.http.html
 */

module.exports.http = {
  middleware: {

    // Define a custom HTTP middleware fn with the key `foobar`:
    foobar: function(req, res, next) { /*...*/
      next();
    },

    // Define another couple of custom HTTP middleware fns with keys `passportInit` and `passportSession`
    // (notice that this time we're using an existing middleware library from npm)
    passportInit: require('passport').initialize(),
    passportSession: require('passport').session(),

    // Override the conventional cookie parser:
    cookieParser: function(req, res, next) { /*...*/
      next();
    },


    // Now configure the order/arrangement of our HTTP middleware
    order: [
      'startRequestTimer',
      'cookieParser',
      'session',
      'passportInit', // <==== passport HTTP middleware should run after "session"
      'passportSession', // <==== (see https://github.com/jaredhanson/passport#middleware)
      'bodyParser',
      'compress',
      'foobar', // <==== we can put this stuff wherever we want
      'methodOverride',
      'poweredBy',
      '$custom',
      'router',
      'www',
      'favicon',
      '404',
      '500'
    ]
  },

    /****************************************************************************
     *                                                                           *
     * Example custom middleware; logs each request to the console.              *
     *                                                                           *
     ****************************************************************************/

  // myRequestLogger: function (req, res, next) {
  //     console.log("Requested :: ", req.method, req.url);
  //     return next();
  // }


  /***************************************************************************
   *                                                                          *
   * The body parser that will handle incoming multipart HTTP requests. By    *
   * default as of v0.10, Sails uses                                          *
   * [skipper](http://github.com/balderdashy/skipper). See                    *
   * http://www.senchalabs.org/connect/multipart.html for other options.      *
   *                                                                          *
   ***************************************************************************/

  //     bodyParser: require('skipper')

  /***************************************************************************
   *                                                                          *
   * The number of seconds to cache flat files on disk being served by        *
   * Express static middleware (by default, these files are in `.tmp/public`) *
   *                                                                          *
   * The HTTP static cache is only active in a 'production' environment,      *
   * since that's the only time Express will cache flat-files.                *
   *                                                                          *
   ***************************************************************************/

   cache: 1296000000
};
