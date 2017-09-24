/**
 * Module Dependencies
 */
var _ = require('lodash'),
  Promise = require('bluebird'),
  Database = require('./database'),
  Collection = require('./collection'),
  Errors = require('waterline-errors').adapter;

var connections = {};

/**
 * sails-elasticsearch
 *
 * Most of the methods below are optional.
 *
 * If you don't need / can't get to every method, just implement
 * what you have time for.  The other methods will only fail if
 * you try to call them!
 *
 * For many adapters, this file is all you need.  For very complex adapters, you may need more flexiblity.
 * In any case, it's probably a good idea to start with one file and refactor only if necessary.
 * If you do go that route, it's conventional in Node to create a `./lib` directory for your private submodules
 * and load them at the top of the file with other dependencies.  e.g. var update = `require('./lib/update')`;
 */
module.exports = {


  // The identity of this adapter, to be referenced by datastore configurations in a Sails app.
  identity: 'sails-elastic',

  // Waterline Adapter API Version
  adapterApiVersion: 1,

  // Default configuration for connections
  defaults: {
    schema: false,
    //  dontUseObjectIds: true,
    hosts: ['127.0.0.1:9200'],
    sniffOnStart: true,
    sniffOnConnectionFault: true,
    keepAlive: false,
    apiVersion: '5.5'
  },

  // This allows outside access to this adapter's internal registry of datastore entries,
  // for use in datastore methods like `.leaseConnection()`.
  datastores: connections,

  /**
   *
   * This method runs when a model is initially registered
   * at server-start-time.  This is the only required method.
   *
   * @param  {[type]}   connection [description]
   * @param  {[type]}   collection [description]
   * @param  {Function} cb         [description]
   * @return {[type]}              [description]
   */
  registerDatastore: function (connection, collections, cb) {
    if (!connection.identity) return cb(Errors.IdentityMissing);
    if (connections[connection.identity]) return cb(Errors.IdentityDuplicate);

    // Store the connection
    connections[connection.identity] = {
      config: connection,
    };

    var self = this;
    // Create a new active connection
    new Database(connection, function (err, es) {
      if (err) return cb(err);
        connections[connection.identity].manager = es;
        connections[connection.identity].driver = {
        collections: {},
      }

      // Build up a registry of collections
      Object.keys(collections).forEach(function (key) {
        connections[connection.identity].driver.collections[key] = new Collection(collections[key], es);
      });

      return cb();
    });
  },


  /**
   * Fired when a model is unregistered, typically when the server
   * is killed. Useful for tearing-down remaining open connections,
   * etc.
   *
   * @param  {Function} cb [description]
   * @return {[type]}      [description]
   */
  // Teardown a Connection
  teardown: function (conn, cb) {
    console.log('tearDown');
    return cb();
  },

  // Return attributes
  describe: function (connection, collection, cb) {
    console.log('describe');
    // Add in logic here to describe a collection (e.g. DESCRIBE TABLE logic)
    return cb();
  },

  /**
   *
   * REQUIRED method if integrating with a schemaful
   * (SQL-ish) database.
   *
   */
  define: function (connection, collection, definition, cb) {
    console.log('define');
    // Add in logic here to create a collection (e.g. CREATE TABLE logic)
    return cb();
  },

  /**
   *
   * REQUIRED method if integrating with a schemaful
   * (SQL-ish) database.
   *
   */
  drop: function (connection, collection, relations, cb) {
    console.log('drop');
    // Add in logic here to delete a collection (e.g. DROP TABLE logic)
    return cb();
  },

  /**
   * todo: Impelmented theoreticaly! Will be need to check later, if we will be need it methods.
   */
  // /**
  //  *
  //  * REQUIRED method if users expect to call Model.find(), Model.findOne(),
  //  * or related.
  //  *
  //  * You should implement this method to respond with an array of instances.
  //  * Waterline core will take care of supporting all the other different
  //  * find methods/usages.
  //  *
  //  */

  // search: function (connectionName, query, cb, indices) {
  //   var connectionObject = connections[connectionName],
  //     collection = connectionObject.collections[query.using];
  //
  //   // Search documents
  //   if (cb === undefined) {
  //     return new Promise(function (resolve, reject) {
  //       collection.search({}, function (err, results) {
  //         if (err)
  //           return reject(err)
  //         else
  //           return resolve(results)
  //       }, indices)
  //     })
  //   }
  //   else {
  //     collection.search({}, cb, indices);
  //   }
  // },

  // create: function (connectionName, query, cb) {
  //   var connectionObject = connections[connectionName],
  //     collection = connectionObject.collections[query.using];
  //
  //
  //   // Index a document
  //   if (cb === undefined) {
  //     return new Promise(function (resolve, reject) {
  //       collection.insert(query.criteria, function (err, res) {
  //         if (err)
  //           return reject(err)
  //         else
  //           return resolve(res)
  //       })
  //     })
  //   }
  //   else {
  //     collection.insert(query.criteria, cb);
  //   }
  // },
  //
  //
  // update: function (connectionName, query, id, cb) {
  //   var connectionObject = connections[connectionName],
  //     collection = connectionObject.collections[query.using];
  //
  //
  //   // Update a document
  //   if (cb === undefined) {
  //     return new Promise(function (resolve, reject) {
  //       collection.update(id, query.criteria, function (err, res) {
  //         if (err)
  //           return reject(err)
  //         else
  //           return resolve(res)
  //       })
  //     })
  //   }
  //   else {
  //     collection.update(id, query, cb);
  //   }
  // },
  //
  // destroy: function (connectionName, query, id, cb) {
  //   var connectionObject = connections[connectionName],
  //     collection = connectionObject.collections[query.using];
  //
  //
  //   // Delete a document
  //   if (cb === undefined) {
  //     return new Promise(function (resolve, reject) {
  //       collection.destroy(id, function (err, res) {
  //         if (err)
  //           return reject(err)
  //         else
  //           return resolve(res)
  //       })
  //     })
  //   }
  //   else {
  //     collection.destroy(id, cb);
  //   }
  // },
  //
  //
  // count: function (connectionName, query, cb) {
  //   var connectionObject = connections[connectionName],
  //     collection = connectionObject.collections[query.using];
  //
  //
  //   // Count documents
  //   if (cb === undefined) {
  //     return new Promise(function (resolve, reject) {
  //       collection.count(query.criteria, function (err, res) {
  //         if (err)
  //           return reject(err)
  //         else
  //           return resolve(res)
  //       })
  //     })
  //   }
  //   else {
  //     collection.count(query, cb);
  //   }
  // },
  //
  // bulk: function (connectionName, query, cb) {
  //   var connectionObject = connections[connectionName],
  //     collection = connectionObject.collections[query.using];
  //
  //
  //   // Bulk documents
  //   if (cb === undefined) {
  //     return new Promise(function (resolve, reject) {
  //       collection.bulk(query.criteria, function (err, res) {
  //         if (err)
  //           return reject(err)
  //         else
  //           return resolve(res)
  //       })
  //     })
  //   }
  //   else {
  //     collection.bulk(query, cb);
  //   }
  // }
}


