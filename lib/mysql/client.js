'use strict';

var mysql = require('mysql2');

function MySQLClient() {
    // 私有变量...
    this.__pool__ = {};
}

MySQLClient.prototype.config = function (mysqlConfig) {
    // var l = arguments.length;
    for (var dbKey in mysqlConfig) {
        if (mysqlConfig.hasOwnProperty(dbKey)) {
            mysqlConfig[dbKey].queryFormat = customizeFormat;
            this.__pool__[dbKey] = mysql.createPool(mysqlConfig[dbKey]);
        }
    }
};

MySQLClient.prototype.query = function (dbKey, sql, params) {
    return new Promise((resolve, reject) => {
        var pool = this.__pool__[dbKey];
        if (!pool) {
            return reject('database connection is not exists');
        }
        pool.getConnection((err, connection) => {
            // do something for connection ;
            // connection;
            if (err) {
                return reject(err.message);
            } else {
                var query = connection.query(
                    sql,
                    params,
                    function (dbErr, result) {
                        connection.release();
                        if (dbErr) {
                            return reject(dbErr.message);
                        }
                        return resolve(result);
                    }
                );
                //console.info(query.sql);
            }
        });
    });
};
MySQLClient.prototype.escape = mysql.escape;
MySQLClient.prototype.escapeId = mysql.escapeId;
MySQLClient.prototype.format = mysql.format;

//
function customizeFormat(query, values) {
    if (!values) {
        return query;
    }

    return query.replace(/\:(\w+)/g, (txt, key) => {
        if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
        }
        return txt;
    });
}

module.exports = new MySQLClient();
