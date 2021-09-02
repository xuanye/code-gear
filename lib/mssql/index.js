const mssql = require('./client');

class MSSqlProvider {
    constructor() {
        this.databaseKey = 'master';
        this.tableInfos = {};
        this.tableSQL = `SELECT  TABLE_CATALOG + '.' + TABLE_SCHEMA + '.' + TABLE_NAME AS FULL_TABLE_NAME,
        TABLE_SCHEMA,
        TABLE_NAME,
        TABLE_TYPE,
        ISNULL(CONVERT(varchar(8000), x.Value), '') AS TABLE_DESC
    FROM
        INFORMATION_SCHEMA.TABLES s
        LEFT JOIN 
            sys.tables t 
        ON 
            OBJECT_ID(TABLE_CATALOG + '.' + TABLE_SCHEMA + '.' + TABLE_NAME) = t.object_id
        LEFT JOIN 
            sys.extended_properties x 
        ON 
            OBJECT_ID(TABLE_CATALOG + '.' + TABLE_SCHEMA + '.' + TABLE_NAME) = x.major_id AND 
            x.minor_id = 0 AND 
            x.name = 'MS_Description'
    WHERE 
    (
        t.object_id IS NULL OR
        t.is_ms_shipped <> 1 AND
        (
            SELECT 
                major_id 
            FROM 
                sys.extended_properties 
            WHERE
                major_id = t.object_id and 
                minor_id = 0           and 
                class    = 1           and 
                name     = N'microsoft_database_tools_support'
            ) IS NULL
    )`;

        this.columnsSQL = `SELECT (TABLE_CATALOG + '.' + TABLE_SCHEMA + '.' + TABLE_NAME) as id,
                            (CASE WHEN IS_NULLABLE = 'YES' THEN 1 ELSE 0 END)         as isNullable,
                            ORDINAL_POSITION         as columnId,
                            COLUMN_NAME              as name,
                            c.DATA_TYPE              as dataType,
                            CHARACTER_MAXIMUM_LENGTH as length, 
                            ISNULL(NUMERIC_PRECISION, DATETIME_PRECISION) AS prec,
                            NUMERIC_SCALE            as scale,
                            COLUMNPROPERTY(object_id('[' + TABLE_SCHEMA + '].[' + TABLE_NAME + ']'), COLUMN_NAME, 'IsIdentity') as isIdentity,
                            ISNULL(CONVERT(varchar(8000), x.Value), '') AS [description]
                        FROM
                            INFORMATION_SCHEMA.COLUMNS c
                        LEFT JOIN 
                            sys.extended_properties x 
                        ON 
                            OBJECT_ID(TABLE_CATALOG + '.' + TABLE_SCHEMA + '.' + TABLE_NAME) = x.major_id AND 
                            ORDINAL_POSITION = x.minor_id AND 
                            x.name = 'MS_Description'`;

        this.primaryKeySQL = `SELECT (k.TABLE_CATALOG + '.' + k.TABLE_SCHEMA + '.' + k.TABLE_NAME) as id,
                                k.CONSTRAINT_NAME                                             as name,
                                k.COLUMN_NAME                                                 as columnName,
                                k.ORDINAL_POSITION                                            as columnId
                            FROM
                                INFORMATION_SCHEMA.KEY_COLUMN_USAGE k
                            JOIN 
                                INFORMATION_SCHEMA.TABLE_CONSTRAINTS c 
                            ON 
                                k.CONSTRAINT_CATALOG = c.CONSTRAINT_CATALOG AND 
                                k.CONSTRAINT_SCHEMA = c.CONSTRAINT_SCHEMA AND 
                                k.CONSTRAINT_NAME = c.CONSTRAINT_NAME
                            WHERE
                                c.CONSTRAINT_TYPE='PRIMARY KEY' `;
    }
    async generate(config) {
        console.log('mssql generate');
        mssql.config(config.database);
        await this.querySchema();
        console.dir(this.tableInfos);
        this.reorganize();
        return this.tableInfos;
    }

    async querySchema() {
        await this.prepareTables();
        await this.prepareColumns();
        await this.preparePrimaryKeys();
    }
    async prepareTables() {
        const tables = await mssql.query(this.tableSQL);
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
    async prepareColumns() {
        const columns = await mssql.query(this.columnsSQL);
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
                    description: column.description,
                };
            }
        });
    }
    async preparePrimaryKeys() {
        const keys = await mssql.query(this.primaryKeySQL);
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

module.exports = new MSSqlProvider();
