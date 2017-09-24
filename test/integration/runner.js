/**
 * Run integration tests
 *
 * Uses the `waterline-adapter-tests` module to
 * run mocha tests against the appropriate version
 * of Waterline.  Only the interfaces explicitly
 * declared in this adapter's `package.json` file
 * are tested. (e.g. `queryable`, `semantic`, etc.)
 */


/**
 * Module dependencies
 */

var util = require('util');
var mocha = require('mocha');
var log = new (require('captains-log'))();
var TestRunner = require('waterline-adapter-tests');
var Adapter = require('../../');


// Grab targeted interfaces from this adapter's `package.json` file:
var package = {};
var interfaces = [];
try {
  package = require('../../package.json');
  interfaces = package['waterlineAdapter'].interfaces;
}
catch (e) {
  throw new Error(
    '\n' +
    'Could not read supported interfaces from `waterlineAdapter.interfaces`' + '\n' +
    'in this adapter\'s `package.json` file ::' + '\n' +
    util.inspect(e)
  );
}


log.info('Testing `' + package.name + '`, a Sails/Waterline adapter.');
log.info('Running `waterline-adapter-tests` against ' + interfaces.length + ' interfaces...');
log.info('( ' + interfaces.join(', ') + ' )');
console.log();
log('Latest draft of Waterline adapter interface spec:');
log('http://links.sailsjs.org/docs/plugins/adapters/interfaces');
console.log();


/**
 * Integration Test Runner
 *
 * Uses the `waterline-adapter-tests` module to
 * run mocha tests against the specified interfaces
 * of the currently-implemented Waterline adapter API.
 */
new TestRunner({

  // Load the adapter module.
  adapter: Adapter,

  // Default adapter config to use.
  config: {
    schema: true,
    hosts: ['127.0.0.1:9200'],
    sniffOnStart: true,
    sniffOnConnectionFault: true,
    keepAlive: false,
    apiVersion: '1.3',
    poolSize: 1
  },

  // The set of adapter interfaces to test against.
  // (grabbed these from this adapter's package.json file above)
  interfaces: interfaces

});
