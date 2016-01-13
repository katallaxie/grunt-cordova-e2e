// syntax
'use strict';

// module
module.exports = grunt => {
  // modules
  const async = require('async');
  const path = require('path');
  const util = require('util');
  const merge = require('deepmerge');

  // maps
  const file = grunt.file;
  // intermediary .json
  const hack = '.nightwatch.json';
  // consts
  const runner = path.resolve(path.dirname(require.resolve('nightwatch')), '../bin/runner.js');
  const args = ['-c', hack];
  const presets = [].concat(require('../lib/ios'));

  // vars
  let env;
  // default
  let options = {
    // testing source
    // folders define groups of tests
    'src_folders': [
      // this is for the end to end
      'tests',
      // this is for the smoke tests
      'src'
    ],
    // filter for .uat
    filter: '*.e2e.js',
    // testing output
    'output_folder': 'reports/e2e',
    // custom commands
    'custom_commands_path': 'lib/e2e/cmd',
    // page objects
    'page_objects_path': 'lib/e2e/objects',
    // custom assertations
    'custom_assertions_path': '',
    // global parameters
    // usage: browser.globals.$variable
    // 'globals_path': 'globals.json',
    // defaults of selenium;
    // yet not starting process
    'selenium': {
      'start_process': false,
      // is automatically set
      'server_path': require('selenium-standalone-jar')(),
      // log
      'log_path': 'reports/e2e/sellenium',
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
    options = this.options(options, this.data.settings);
    // deepmerge presets on the settings
    presets.forEach(preset => {
      options['test_settings'] = merge(preset, options['test_settings']);
    });
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
    grunt.file.write(path.resolve(process.cwd(), hack), JSON.stringify(options, null, 2), null);
    // queuing the envs
    env.forEach( e => {
      tasks.push(task(e));
    });
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
