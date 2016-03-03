// syntax
'use strict';

// module
module.exports = grunt => {
  // modules
  const async = require('async');
  const path = require('path');
  const util = require('util');
  const merge = require('deepmerge');
  const needle = require('needle');
  const fs = require('fs');
  // const promise = require('promise');

  // load browserSync
  const browserSync = require('browser-sync').create();

  // maps
  const file = grunt.file;
  const log = grunt.log;

  // intermediary .json
  const hack = '.nightwatch.json';

  // consts
  const runner = path.resolve(path.dirname(require.resolve('nightwatch')), '../bin/runner.js');
  const args = ['-c', hack];
  const presets = [].concat( require('../lib/ios'), require('../lib/phantom') );

  // defaults
  const settings = {
    // testing source
    // folders define groups of tests
    'src_folders': [],
    // global parameters
    // usage: browser.globals.$variable
    // defaults of selenium;
    // yet not starting process
    'selenium': {
      'start_process': true,
      // is automatically set
      'server_path': require('selenium-standalone-jar')(),
      // log
      'log_path': '',
      // hostname
      // perhaps change to use sellenium grid
      'host': '127.0.0.1',
      // port
      'port': 4444,
      // client settings
      'cli_args': {
        // chromedriver; default is firefox
        // is used when browserName: Chrome
        'webdriver.chrome.driver': require('chromedriver').path,
        'webdriver.ie.driver': ''
      },
      // this is for multi-threading
      'test_workers' : {
        'enabled' : true,
        'workers' : 'auto'
      }
    },
    'test_settings': {
      'default': ''
    }
  };

  // default live variables
  const live = {
    port : 8080,
    logLevel : 'debug',
    open : false,
    server : [ 'src' ]
  };

  // run the tests
  function run (tasks, done) {
    // going parallel
    async.parallel(tasks, error => {
      if (error) {
        grunt.fail.fatal(`Error-> Running the tests`);
      }
      // nothing else to do, finish task
      done(true);
    });
  }

  // spawning task
  function task (e) {
    return callback => {
      // spawning a process
      grunt.util.spawn({
        cmd: 'node',
        args: [].concat(runner, [].concat(args, '--env', e)),
        opts: {
          stdio: 'inherit'
        },
        env: util._extend( {}, process.env )
      }, (error, result, code) => {
        callback(code !== 0 ? `Running test failed with ${code}` : null, `Success -> Running ${e}`);

        // delete intermediare configs
        file.delete( hack );
      } );
    };
  }

  // register as multi task to have multiple targets running
  grunt.registerMultiTask('e2e', 'Run e2e test for your Cordova project', function () {
    // async
    let done = this.async(),
      tasks = [],
      options = this.options(settings, this.data.settings),
      env = grunt.option('env'),
      argv = this.data.argv || {},
      sync = argv.live ? merge( live, argv.live || {} ) : '',
      saucelabs = grunt.option('saucelabs');

    // helpers
    let runTests = () => {
      // writing intermediary config
      grunt.file.write( path.resolve( process.cwd(), hack ), JSON.stringify( options, null, 2 ), null);

      // this is wrapper code; we could do something amazing perhaps later on
      tasks.push( task( env.join( ',' ) ) );

      // env.forEach( e => {
      //   tasks.push(task(e));
      // });
      // check if there is something in the queue
      if (tasks.length > 0) {
        // run the task queue
        run(tasks, done);
      } else {
        // delete intermediare configs
        file.delete(hack);
        // end, if there is nothing in the queue
        done();
      }
    };

    // uploading an artifact to saucelabs
    let uploadSaucelabs = config => {
      // files
      config.storage.files.forEach( ( file, index, files ) => {
        // file
        const buffer = fs.readFileSync(file);
        // request
        const http = {
          headers : {
            'Authorization' : `Basic ${ new Buffer( `${ config.username }:${ config.token }` ).toString('base64') }`,
            'Content-Type' : 'application/octet-stream',
            'Content-Length' : buffer.length,
          },
          timeout: 5000 * 1000
        };
        // debug
        log.ok( `Uploading ${ file } ...` );
        // do the request
        needle
          .post(`${ config.storage.url }/${ config.username }/${ file }?${ config.storage.params }`, buffer, http, function ( error, response ) {
            if ( ! error && response.statusCode === 200) {
              log.ok( `Success` );
            } else {
              log.fail( `Error ${ error }` );
            }
            // check for end
            if ( index === files.length - 1 ) {
              done();
            }
          } );
      } );
    };

    // parsing the
    env = !! env || typeof env === 'string' ?
      env.split(',') : [].concat(argv.env || 'default');

    // deepmerge presets on the settings
    presets.forEach( preset => {
      // this will yell at you, but is better then dot notation
      options['test_settings'] = merge(preset, options['test_settings']);
    } );

    if ( saucelabs && !! argv.saucelabs ) {
      uploadSaucelabs(argv.saucelabs);
      // done();
    } else {
      if ( sync ) {
        browserSync.init(sync, runTests);
      } else {
          runTests();
      }
    }

  });

};
