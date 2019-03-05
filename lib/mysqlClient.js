'use strict';

var mysql   = require('mysql');



function MySQLClient(){
    // 私有变量...
    this.__pool__  = {};

}

MySQLClient.prototype.config = function (mysqlConfig) {
    var l = arguments.length;
    for (var dbkey in mysqlConfig) {
        if (mysqlConfig.hasOwnProperty(dbkey)) {
            mysqlConfig[dbkey].queryFormat = customerFormat;
            this.__pool__[dbkey] = mysql.createPool(mysqlConfig[dbkey]);
        }

    }
};

MySQLClient.prototype.query = function(dbKey, sql, params ,callback){
    // 获取已经打开的链接
    var pool = this.__pool__[dbKey];
    if(!pool){ //链接不存在
        callback({'message':'对应的数据库链接不存在'});
    }
    else{
        pool.getConnection(function(err,connection) {
            // do something for connection ;
            // connection;
            if(err){
                callback(err);
            }
            else{
               var query = connection.query(sql,params,function(dberr,resluts){
                    connection.release();
                    callback(dberr,resluts);
               });

               //console.info(query.sql);
            }
        });
    }
};
MySQLClient.prototype.escape = mysql.escape;
MySQLClient.prototype.escapeId = mysql.escapeId;
MySQLClient.prototype.format = mysql.format;


//
function customerFormat (query, values) {
    if (!values) {
        return query;
    }
  
    return query.replace(/\:(\w+)/g, function (txt, key) {
        if (values.hasOwnProperty(key)) {
          return this.escape(values[key]);
        }
        return txt;   
    }.bind(   /*jshint validthis:true */this));
}

module.exports =  new MySQLClient() ;
