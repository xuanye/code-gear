const mysql = require('./mysqlClient');
const async = require('async');

const dbKey = "master";
const dbSchema = module.exports;

dbSchema.getSchema = function(dbName,callback){
    const tableInfos = {};

    const tableSQL = 'SELECT CONCAT(TABLE_SCHEMA, \'.\', TABLE_NAME) as FULL_TABLE_NAME,TABLE_SCHEMA,TABLE_NAME,TABLE_TYPE '+
                     ' FROM INFORMATION_SCHEMA.tables WHERE  '+
				     ' TABLE_SCHEMA = \''+dbName+'\' AND '+ 
				     ' TABLE_TYPE IN (\'BASE TABLE\', \'VIEW\')';
		
    const columnsSQL = 'SELECT '+
        'CONCAT(TABLE_SCHEMA, \'.\', TABLE_NAME)           as id,'+
        'CASE WHEN IS_NULLABLE = \'YES\' THEN 1 ELSE 0 END as isNullable,'+
        'ORDINAL_POSITION         as colid,'+
        'COLUMN_NAME              as name,'+
        'c.DATA_TYPE              as dataType,'+
        'CHARACTER_MAXIMUM_LENGTH as length, '+
        'NUMERIC_PRECISION        as prec,'+
        'NUMERIC_SCALE            as scale,'+
        'EXTRA = \'auto_increment\' as isIdentity,'+
        'c.COLUMN_TYPE            as columnType,'+
        'COLUMN_DEFAULT           as columnDefault,'+
        'EXTRA                    as extra,'+
        'COLUMN_COMMENT			 as description'+
    ' FROM '+
    '    INFORMATION_SCHEMA.COLUMNS c'+
    ' WHERE'+
    '    TABLE_SCHEMA = \''+dbName+'\'';

    const pkSQL = 'SELECT '+
    'CONCAT(k.TABLE_SCHEMA, \'.\', k.TABLE_NAME) as id,'+
    'k.CONSTRAINT_NAME                         as name,'+
    'k.COLUMN_NAME                             as colname,'+
    'k.ORDINAL_POSITION                        as colid'+
    ' FROM'+
    ' INFORMATION_SCHEMA.KEY_COLUMN_USAGE k'+
    '    JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS c ON k.CONSTRAINT_NAME = c.CONSTRAINT_NAME'+
    ' WHERE'+
    ' c.CONSTRAINT_TYPE=\'PRIMARY KEY\' AND'+
    ' k.TABLE_SCHEMA = \''+dbName+'\''+	
    ' GROUP BY id, colid'


    async.parallel([
        function(callback){
            mysql.query(dbKey,tableSQL,(error,tables)=>{
                error && console.error(error);
                callback(error,tables);
            })
        },
        function(callback){
            mysql.query(dbKey,columnsSQL,(error,columns)=>{
                error && console.error(error);
                callback(error,columns);
            })
        },
        function(callback){
            mysql.query(dbKey,pkSQL,(error,pks)=>{
                error && console.error(error);
                callback(error,pks);
            })
        }
      ],
      function(err, results){
        if(err){
            callback(err,null);
        }
        
        // 在这里处理data和data2的数据,每个文件的内容从results中获取
        results[0].forEach(table => {
            tableInfos[table.FULL_TABLE_NAME] = {
                "tableName":table.TABLE_NAME,
                "databaseName":table.TABLE_SCHEMA,
                "fullTableName":table.FULL_TABLE_NAME,
                "columnsCache": {},
                "columns":[],
            };
        });
        results[1].forEach(column =>{           
            if(tableInfos[column.id]){
               tableInfos[column.id].columnsCache[column.name] = {                  
                    'isNullable': column.isNullable,
                    'colid': column.colid,
                    'name': column.name,
                    'dataType': column.dataType,
                    'length': column.length,
                    'prec': column.prec,
                    'scale': column.scale,
                    'isIdentity':column.isIdentity,
                    'columnType': column.columnType,
                    'columnDefault': column.columnDefault,     
                    'extra': column.extra,              
                    'description': column.description
               }
            }           
        });

        results[2].forEach( pk =>{
            if(tableInfos[pk.id]){
                tableInfos[pk.id].columnsCache[pk.colname].isPK = 1;              
            }
        });

        for( var t in tableInfos){
            if(tableInfos.hasOwnProperty(t)){
               
                var table = tableInfos[t];
                for(var c in table.columnsCache){
                  
                    if(table.columnsCache.hasOwnProperty(c)){
                        table.columns.push(table.columnsCache[c]);
                    }
                }
                delete table.columnsCache;
            }
        }

        callback(err,tableInfos);
    });
}


