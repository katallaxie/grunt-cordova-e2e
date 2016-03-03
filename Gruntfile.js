/*
 * grunt-cordova.icons
 * https://github.com/katallaxie/grunt-cordova-e2e
 *
 * Copyright (c) 2016 Sebastian Döll
 * Licensed under the MIT license
 */
// syntax
'use strict';

// module
module.exports = ( grunt ) => {
  // project configuration
  grunt.initConfig( {
    e2e: {
      all: {
        argv: {
          env: [ 'phantomjs' ],
          // resembles browsersync
          // live: {
          //   port : 8080,
          //   ui : {
          //     port : 8081, // default is 3001
          //     weinre : {
          //       port : 9090
          //     }
          //   },
          //   logLevel : 'debug',
          //   open : false,
          //   server : [ 'src' ]
          // },
          saucelabs : {
            username : 'sebastian_doell',
            token : '088fceb5-2a87-4324-8ffc-50e34e3dcb75',
            storage : {
              url : 'https://saucelabs.com/rest/v1/storage',
              params : 'overwrite=true',
              files : [ './test/android.zip' ]
            }
          }
        },
        options: {
          'test_settings': {
            // for debugging
            'chrome': {
              'launch_url': 'http://localhost:8080',
              'desiredCapabilities': {
                'browserName': 'chrome',
                'javascriptEnabled': true,
                'acceptSslCerts': true,
                'chromeOptions': {
                  'args': ['--disable-web-security --allow-file-from-files']
                }
              },
            },
            'saucelabs': {
              'launch_url': 'http://127.0.0.1:4723/wd/hub',
              'selenium_host': 'ondemand.saucelabs.com',
              'selenium_port': 80,
              'username': 'sebastian_doell',
              'output': true,
              // 'silent': true,
              'access_key': '088fceb5-2a87-4324-8ffc-50e34e3dcb75',
              'screenshots': {
                'enabled': false,
                'on_failure': true
              },
              'test_workers': {
                'enabled' : true, 'workers' : 'auto'
              },
              'desiredCapabilities': {
                'name': 'DDS-SCM-FULL',
                'browserName': '',
                'platformName': 'Android',
                'platformVersion': '5.0',
                'appiumVersion': '1.4.16',
                'deviceName': 'Android Emulator',
                'deviceType': 'phone',
                'deviceOrientation': 'portrait',
                'app': 'sauce-storage:android.apk.zip'
              },
              'sellenium': {
                'start_process': false
              }
            }
          },
        },
        'settings': {
          src_folders: [ 'src' ],
          // filter for .uat
          filter: '*.e2e.js',
          // testing output
          'output_folder': 'reports/e2e',
          // custom commands
          'custom_commands_path': 'test/cmd',
          // page objects
          'page_objects_path': 'test/object',
          // custom assertations
          'custom_assertions_path': 'test/assert'
        }
      }
    },

    // checking code style
    eslint: {
      options: {
        format: 'stylish'
      },
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ]
    },
    // before testing anything, clear the relevant paths
    clean: {
      test: [ 'build' ]
    },

  } );

  // load the plugin task
  grunt.loadTasks( 'tasks' );

  // By default, lint and run all tests.
  grunt.registerTask( 'default', [ 'browserSync', 'e2e' ] );

};
