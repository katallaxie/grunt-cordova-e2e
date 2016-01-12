// syntax
'use strict';

// module
module.exports = grunt => {
  // dependencies
  const async = require('async');
  const path = require('path');
  const util = require('util');
  // map
  const log = grunt.log;
  const file = grunt.file;
  // consts
  const runner = path.resolve(path.dirname(require.resolve('nightwatch')), '../bin/runner.js');
  const args = ['-c', 'nightwatch.json'];
  // intermediary .json
  // I found this hack for avoiding intermediate .json files
  const hack = '__nightwatch__';
  // default
  let options = {
    // testing source
    // folders define groups of tests
    'src_folders': [
      'test/uat'
    ],
    // testing output
    'output_folder': 'reports/uat',
    // custom commands
    'custom_commands_path': 'uat/lib/cmd',
    // page objects
    'page_objects_path': 'uat/lib/objects',
    // custom assertations
    'custom_assertions_path': '',
    // global parameters
    // usage: browser.globals.$variable
    'globals_path': 'uat/lib/config/globals.json',
    // defaults of selenium;
    // yet not starting process
    'selenium': {
      'start_process': false,
      // is automatically set
      'server_path': require('selenium-standalone-jar')(),
      // log
      'log_path': 'reports/uat/sellenium',
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
      }
    }
  };

  function run (tasks, done) {
    // going parallel
    async.parallel(tasks, error => {
      if (error) {
        throw util.fail.fatal(`Processing testing environment`);
      }
      // nothing else to do, finish task
      done(true);
    });
  }

  // spawning task
  function task (env) {
    return callback => {
      // spawning a process
      grunt.util.spawn({
        cmd: 'node',
        args: [].concat(runner, args),
        opts: {
          stdio: 'inherit'
        },
        env: util._extend({}, process.env)
      }, (error, result, code) => {
        callback(code !== 0 ? `Running test failed with ${code}` : null, `Success -> Running ${env}`);
      });
    };
  }

  // register as multi task to have multiple targets running
  grunt.registerMultiTask('e2e', 'Run e2e test for your Cordova project', function () {
    // async
    let done = this.async(),
      tasks = [];
    // defaults
    options = this.options(options);
    // writing intermediary config
    grunt.file.write(path.resolve(process.cwd(), hack), JSON.stringify(options, null, 2), null);
    // checki if there is something in the queue
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
