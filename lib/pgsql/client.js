"use strict";

var pgsql = require("pg");

function PgSQLClient() {
  // 私有变量...
  this.__pool__ = {};
}

PgSQLClient.prototype.config = function (dbConfig) {
  // var l = arguments.length;
  for (var dbKey in dbConfig) {
    if (dbConfig.hasOwnProperty(dbKey)) {
      this.__pool__[dbKey] = new pgsql.Pool(dbConfig[dbKey]);
    }
  }
};

PgSQLClient.prototype.query = function (dbKey, sql, params) {
  return new Promise((resolve, reject) => {
    var pool = this.__pool__[dbKey];
    if (!pool) {
      return reject("database connection is not exists");
    }
    pool.connect().then((connection) => {
      connection.query(sql, params, function (dbErr, result) {
        connection.release();
        if (dbErr) {
          return reject(dbErr.message);
        }
        return resolve(result.rows);
      });
      //console.info(query.sql);
    });
  });
};

module.exports = new PgSQLClient();
