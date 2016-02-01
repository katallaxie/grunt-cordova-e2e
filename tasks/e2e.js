// syntax
'use strict';

// module
module.exports = grunt => {
  // modules
  const async = require('async');
  const path = require('path');
  const util = require('util');
  const merge = require('deepmerge');
  const live = require('live-server');

  // maps
  const file = grunt.file;

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
        callback(code !== 0 ? `Running test failed with ${code}` : null, `Success -> Running ${env}`);
      });
    };
  }

  // register as multi task to have multiple targets running
  grunt.registerMultiTask('e2e', 'Run e2e test for your Cordova project', function () {
    // async
    let done = this.async(),
      tasks = [],
      options,
      env;

    // defaults
    options = this.options(settings, this.data.settings);

    // deepmerge presets on the settings
    presets.forEach( preset => {
      // this will yell at you, but is better then dot notation
      options['test_settings'] = merge(preset, options['test_settings']);
    } );

    // default envs to test, if so nothing else is set
    try {
      env = [].concat(this.data.settings.argv.env);
    } catch (e) {
      env = (() => {
        let defaults = [];
        presets.forEach(preset => {
          for (let prop in preset) {
            defaults.push(prop);
          }
        });
        return defaults;
      })();
    }

    // writing intermediary config
    grunt.file.write( path.resolve( process.cwd(), hack ), JSON.stringify( options, null, 2 ), null);

    // params for the live server
    const params = {
      port: 8181, // Set the server port. Defaults to 8080.
      host: '0.0.0.0', // Set the address to bind to. Defaults to 0.0.0.0.
      root: '/src', // Set root directory that's being server. Defaults to cwd.
      open: false, // When false, it won't load your browser by default.
      ignore: 'scss,my/templates', // comma-separated string for paths to ignore
      file: 'index.html', // When set, serve this file for every 404 (useful for single-page applications)
      wait: 1000 // Waits for all changes, before reloading. Defaults to 0 sec.
      // mount: [['/components', './node_modules']] // Mount a directory to a route.
    };

    // start the live server
    live.start(params);

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
  });
};
