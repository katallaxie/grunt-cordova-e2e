/*
 * grunt-cordova.icons
 * https://github.com/katallaxie/grunt-cordova-icons
 *
 * Copyright (c) 2016 Sebastian Döll
 * Licensed under the MIT license
 */
// syntax
'use strict';

// module
module.exports = (grunt) => {
  // project configuration
  grunt.initConfig({
    e2e  : {
      all: {
        options : {
          'test_settings': {
            'ios_9_2_ipad_pro': {
              'launch_url': 'http://127.0.0.1:4723'
            }
          }
        },
        'settings': {
          
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
      test: ['build']
    },

  });

  // load the plugin task
  grunt.loadTasks('tasks');

  // load development tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-eslint');

  // when testing then first clean the relevant dirs and produce the icons
  grunt.registerTask('test', ['clean', 'icons']);
  // TODO: add unit tests

  // By default, lint and run all tests.
  grunt.registerTask('default', ['eslint', 'test']);

};
