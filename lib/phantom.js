// syntax
'use strict';

// modules
const name = `phantomjs`;

// create preset
const preset = () => {
  // simply return phantomjs
  return {
    [name] : {
      'desiredCapabilities' : {
        'browserName' : name,
        'javascriptEnabled' : true,
        'acceptSslCerts' : true,
        'phantomjs.binary.path' : process.env.PHANTOMJS_BIN
      }
    }
  };
};

module.exports = preset() || [];
