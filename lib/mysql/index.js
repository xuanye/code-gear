const mysql = require('./client');

class MySqlProvider {
    constructor() {
        this.databaseKey = 'master';
        this.tableInfos = {};
        this.tableSQL = `SELECT CONCAT(TABLE_SCHEMA, '.', TABLE_NAME) as FULL_TABLE_NAME,
                        TABLE_SCHEMA,TABLE_NAME,TABLE_TYPE 
                        FROM INFORMATION_SCHEMA.tables WHERE  
                        TABLE_SCHEMA = :databaseName AND 
                        TABLE_TYPE IN ('BASE TABLE', 'VIEW')`;

        this.columnsSQL = `SELECT CONCAT(TABLE_SCHEMA, '.', TABLE_NAME)           as id,
                        CASE WHEN IS_NULLABLE = 'YES' THEN 1 ELSE 0 END as isNullable,
                        ORDINAL_POSITION         as columnId,
                        COLUMN_NAME              as name,
                        c.DATA_TYPE              as dataType,
                        CHARACTER_MAXIMUM_LENGTH as length, 
                        NUMERIC_PRECISION        as prec,
                        NUMERIC_SCALE            as scale,
                        EXTRA = 'auto_increment' as isIdentity,
                        c.COLUMN_TYPE            as columnType,
                        COLUMN_DEFAULT           as columnDefault,
                        EXTRA                    as extra,
                        COLUMN_COMMENT			 as description
                    FROM 
                        INFORMATION_SCHEMA.COLUMNS c WHERE TABLE_SCHEMA = :databaseName`;

        this.primaryKeySQL = `SELECT DISTINCT CONCAT(k.TABLE_SCHEMA, '.', k.TABLE_NAME) as id,
                        k.CONSTRAINT_NAME                         as name,
                        k.COLUMN_NAME                             as columnName,
                        k.ORDINAL_POSITION                        as columnId
                        FROM  INFORMATION_SCHEMA.KEY_COLUMN_USAGE k
                            JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS c ON k.CONSTRAINT_NAME = c.CONSTRAINT_NAME
                        WHERE
                        c.CONSTRAINT_TYPE='PRIMARY KEY' AND
                        k.TABLE_SCHEMA = :databaseName`;
    }
    async generate(config) {
        console.log('mysql generate');
        mysql.config({ master: config.database });
        await this.querySchema(config.database.database);
        this.reorganize();
        return this.tableInfos;
    }

    async querySchema(databaseName) {
        await this.prepareTables(databaseName);
        await this.prepareColumns(databaseName);
        await this.preparePrimaryKeys(databaseName);
    }
    async prepareTables(databaseName) {
        const tables = await mysql.query(this.databaseKey, this.tableSQL, {
            databaseName,
        });
        tables.forEach((table) => {
            this.tableInfos[table.FULL_TABLE_NAME] = {
                tableName: table.TABLE_NAME,
                databaseName: table.TABLE_SCHEMA,
                fullTableName: table.FULL_TABLE_NAME,
                columnsCache: {},
                columns: [],
            };
        });
        //return tables;
    }
    async prepareColumns(databaseName) {
        const columns = await mysql.query(this.databaseKey, this.columnsSQL, {
            databaseName,
        });
        columns.forEach((column) => {
            if (this.tableInfos[column.id]) {
                this.tableInfos[column.id].columnsCache[column.name] = {
                    isNullable: column.isNullable,
                    columnId: column.columnId,
                    name: column.name,
                    dataType: column.dataType,
                    length: column.length,
                    prec: column.prec,
                    scale: column.scale,
                    isIdentity: column.isIdentity,
                    columnType: column.columnType,
                    columnDefault: column.columnDefault,
                    extra: column.extra,
                    description: column.description,
                };
            }
        });
    }
    async preparePrimaryKeys(databaseName) {
        const keys = await mysql.query(this.databaseKey, this.primaryKeySQL, {
            databaseName,
        });
        keys.forEach((pk) => {
            if (this.tableInfos[pk.id]) {
                this.tableInfos[pk.id].columnsCache[pk.columnName].isPK = 1;
            }
        });
    }
    reorganize() {
        for (var tableName in this.tableInfos) {
            if (this.tableInfos.hasOwnProperty(tableName)) {
                var table = this.tableInfos[tableName];
                for (var column in table.columnsCache) {
                    if (table.columnsCache.hasOwnProperty(column)) {
                        table.columns.push(table.columnsCache[column]);
                    }
                }
                delete table.columnsCache;
            }
        }
    }
}

module.exports = new MySqlProvider();
