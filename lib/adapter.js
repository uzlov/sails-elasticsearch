/**
 * Module Dependencies
 */
var _ = require('lodash'),
  Promise = require('bluebird'),
  Database = require('./database'),
  Collection = require('./collection'),
  Errors = require('waterline-errors').adapter;

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
module.exports = (function () {


  var connections = {};

  var adapter = {

    syncable: false,

    adapterApiVersion: 1,

    // Default configuration for connections
    defaults: {
      hosts: ['127.0.0.1:9200'],
      sniffOnStart: true,
      sniffOnConnectionFault: true,
      keepAlive: false,
      apiVersion: '5.5'
    },

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
        collections: {}
      };

      // Create a new active connection
      new Database(connection, function (err, es) {
        if (err) return cb(err);
        connections[connection.identity].connection = es;

        // Build up a registry of collections
        Object.keys(collections).forEach(function (key) {
          connections[connection.identity].collections[key] = new Collection(collections[key], es);
        });

        cb();
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
      cb();
    },

    // Returns elastic search connection for custom methods
    client: function (connection, collection, cb) {
      var promisifiedClient = Promise.promisifyAll(connections[connection].connection.client);
      if (cb) cb(null, promisifiedClient);
      else return promisifiedClient;
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
     *
     * REQUIRED method if users expect to call Model.find(), Model.findOne(),
     * or related.
     *
     * You should implement this method to respond with an array of instances.
     * Waterline core will take care of supporting all the other different
     * find methods/usages.
     *
     */

    search: function (connectionName, collectionName, options, cb, indices) {
      options = options || {};
      var connectionObject = connections[connectionName],
        collection = connectionObject.collections[collectionName];


      // Search documents
      if (cb === undefined) {
        return new Promise(function (resolve, reject) {
          collection.search(options, function (err, results) {
            if (err)
              return reject(err)
            else
              return resolve(results)
          }, indices)
        })
      }
      else {
        collection.search(options, cb, indices);
      }
    },

    create: function (connectionName, collectionName, options, cb) {
      options = options || {};
      var connectionObject = connections[connectionName],
        collection = connectionObject.collections[collectionName];


      // Index a document
      if (cb === undefined) {
        return new Promise(function (resolve, reject) {
          collection.insert(options, function (err, res) {
            if (err)
              return reject(err)
            else
              return resolve(res)
          })
        })
      }
      else {
        collection.insert(options, cb);
      }
    },


    update: function (connectionName, collectionName, id, options, cb) {
      options = options || {};
      var connectionObject = connections[connectionName],
        collection = connectionObject.collections[collectionName];


      // Update a document
      if (cb === undefined) {
        return new Promise(function (resolve, reject) {
          collection.update(id, options, function (err, res) {
            if (err)
              return reject(err)
            else
              return resolve(res)
          })
        })
      }
      else {
        collection.update(id, options, cb);
      }
    },

    destroy: function (connectionName, collectionName, id, cb) {
      var connectionObject = connections[connectionName],
        collection = connectionObject.collections[collectionName];


      // Delete a document
      if (cb === undefined) {
        return new Promise(function (resolve, reject) {
          collection.destroy(id, function (err, res) {
            if (err)
              return reject(err)
            else
              return resolve(res)
          })
        })
      }
      else {
        collection.destroy(id, cb);
      }
    },

    createIndex: this.create,
    updateIndex: this.update,
    destroyIndex: this.destroy,

    countIndex: function (connectionName, collectionName, options, cb) {
      var connectionObject = connections[connectionName],
        collection = connectionObject.collections[collectionName];


      // Count documents
      if (cb === undefined) {
        return new Promise(function (resolve, reject) {
          collection.count(options, function (err, res) {
            if (err)
              return reject(err)
            else
              return resolve(res)
          })
        })
      }
      else {
        collection.count(options, cb);
      }
    },

    bulk: function (connectionName, collectionName, options, cb) {
      var connectionObject = connections[connectionName],
        collection = connectionObject.collections[collectionName];


      // Bulk documents
      if (cb === undefined) {
        return new Promise(function (resolve, reject) {
          collection.bulk(options, function (err, res) {
            if (err)
              return reject(err)
            else
              return resolve(res)
          })
        })
      }
      else {
        collection.bulk(options, cb);
      }
    }
  };

  // Expose adapter definition
  return adapter;
})();

