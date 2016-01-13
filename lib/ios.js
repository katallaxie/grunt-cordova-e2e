// syntax
'use strict';

// modules
const path = require('path');
const shell = require('shelljs');
const grunt = require('grunt');

// vars
let XcrunParser =  require(path.join(path.dirname(require.resolve('simctl')), 'lib/simctl-list-parser'));

// capabilities
function capabilities (include, silent) {
  // default
  include = (include || 'devices').toLowerCase();
  // command
  let cmd = `xcrun simctl list ${include}`,
    sims;

  // shell
  let res = shell.exec(cmd, {silent: silent || true});
  // output
  if (res.code === 0) {
    try {
      // parser
      let parser = new XcrunParser();
      sims = parser.parse(res.output);
    } catch (error) {
      grunt.fail.fatal('Error-> Parsing Xcode simulator settings');
    }
  }

  // filter
  sims = sims[include].filter(sim => {
    return ! /^Unavailable/i.test(sim.runtime);
  });

  // return the capabilities
  return sims;
}

function presets () {
  // getting the capabilities of
  let caps = capabilities(),
    settings = [];

  // filter unsupported runtimes
  caps = caps.filter(cap => {
    return ! /^tvOS|^watchOS/i.test(cap.runtime);
  });

  // moving the caps to the settings
  caps.forEach(cap => {
    // runtime
    let runtime = cap.runtime.split(' '),
      os = runtime[0],
      version = runtime[1];
    // devices
    cap.devices.forEach(device => {
      settings.push({[
        // string of the runtime
        [cap.runtime.toLowerCase()
          .replace(/\s/g, '_')
          .replace(/[.\s]+/, '_'),
          // string of the device
          device.name.toLowerCase().replace(/\s/g, '_')].join('_')
      ] : {
        desiredCapabilities : {
          platformName : os,
          browserName: os,
          devicename: device.name,
          udid: device.id,
          version: version
        }
      }});
    });
  });

  return settings;
}

module.exports = /darwin/.test(process.platform) ? presets() : [];
