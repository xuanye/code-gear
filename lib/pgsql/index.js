const pqsql = require("./client");

class PgSqlProvider {
  constructor() {
    this.databaseKey = "master";
    this.tableInfos = {};
    this.tableSQL = `SELECT CONCAT(table_catalog, '.', TABLE_NAME) as full_table_name,
                            table_catalog,table_name,table_type 
                            FROM INFORMATION_SCHEMA.tables WHERE                            
                            table_type ='BASE TABLE'   AND 
                            table_catalog = $1 AND 
                            table_schema not in ('information_schema', 'pg_catalog');`;

    /*
      SELECT a.attnum, a.attname AS field, t.typname AS type, a.attlen AS length, a.atttypmod AS lengthvar
      , a.attnotnull AS notnull, b.description AS comment
  FROM  pg_attribute a
  INNER JOIN pg_class c on a.attrelid = c.oid
  INNER JOIN pg_type t on a.atttypid = t.oid
  LEFT JOIN pg_description b ON a.attrelid = b.objoid AND a.attnum = b.objsubid 
  LEFT JOIN pg_attrdef d ON d.adrelid = c.oid and a.attnum = d.adnum
  WHERE c.relname = 'application'  AND a.attnum > 0
  ORDER BY a.attnum;
    */
    this.columnsSQL = `select  CONCAT(table_catalog, '.', table_name)           as id,
    CASE WHEN IS_NULLABLE = 'YES' THEN 1 ELSE 0 END as is_nullable,
         ordinal_position as column_id,
         column_name,
         data_type,
         NUMERIC_PRECISION        as prec,
         NUMERIC_SCALE            as scale,
         case when character_maximum_length is not null
              then character_maximum_length
              else numeric_precision end as max_length,     
       case when column_default like 'nextval(%' then 1  else 0 end	is_identity,
         column_default as default_value
  from information_schema.columns
  where table_schema not in ('information_schema', 'pg_catalog') and  table_catalog =  $1
  order by table_catalog, 
           table_name,
           ordinal_position;`;

    this.primaryKeySQL = `select distinct concat(k.table_catalog, '.', k.table_name) as id,
                            k.constraint_name                         as name,
                            k.column_name                             as column_name,
                            k.ordinal_position                        as column_id
                            from  information_schema.key_column_usage k
                                join information_schema.table_constraints c on k.constraint_name = c.constraint_name
                            where
                            c.constraint_type='PRIMARY KEY' and k.table_catalog =$1 and 
                            k.table_catalog not in ('information_schema', 'pg_catalog')`;

    this.columnDesSQL = ` SELECT a.attnum, a.attname AS field, t.typname AS type, a.attnotnull AS notnull
    , b.description,c.relname as table_name
    FROM  pg_attribute a
    INNER JOIN pg_class c on a.attrelid = c.oid
    INNER JOIN pg_type t on a.atttypid = t.oid
    LEFT JOIN pg_description b ON a.attrelid = b.objoid AND a.attnum = b.objsubid 
    WHERE a.attnum > 0 
    and c.relname in (SELECT tablename FROM pg_tables where schemaname not in ('information_schema', 'pg_catalog'))
    ORDER BY a.attnum;`;
  }

  async generate(config) {
    console.log("pqsql generate");
    pqsql.config({ master: config.database });
    await this.querySchema(config.database.database);
    this.reorganize();
    return this.tableInfos;
  }

  async querySchema(databaseName) {
    await this.prepareTables(databaseName);
    await this.prepareColumns(databaseName);
    await this.preparePrimaryKeys(databaseName);
    await this.prepareColumnDes(databaseName);
  }
  async prepareTables(databaseName) {
    const tables = await pqsql.query(this.databaseKey, this.tableSQL, [
      databaseName,
    ]);

    tables.forEach((table) => {
      this.tableInfos[table.full_table_name] = {
        tableName: table.table_name,
        databaseName: table.table_catalog,
        fullTableName: table.full_table_name,
        columnsCache: {},
        columns: [],
      };
    });
    //return tables;
  }
  async prepareColumns(databaseName) {
    const columns = await pqsql.query(this.databaseKey, this.columnsSQL, [
      databaseName,
    ]);
    columns.forEach((column) => {
      if (this.tableInfos[column.id]) {
        this.tableInfos[column.id].columnsCache[column.column_name] = {
          isNullable: column.is_nullable,
          columnId: column.column_id,
          name: column.column_name,
          dataType: column.data_type,
          length: column.max_length,
          prec: column.prec,
          scale: column.scale,
          isIdentity: column.is_identity,
          columnType: column.data_type,
          columnDefault: column.default_value,
          extra: "",
          description: "",
        };
      }
    });
  }
  async preparePrimaryKeys(databaseName) {
    const keys = await pqsql.query(this.databaseKey, this.primaryKeySQL, [
      databaseName,
    ]);
    keys.forEach((pk) => {
      if (this.tableInfos[pk.id]) {
        this.tableInfos[pk.id].columnsCache[pk.column_name].isPK = 1;
      }
    });
  }
  async prepareColumnDes(databaseName) {
    const cols = await pqsql.query(this.databaseKey, this.columnDesSQL, []);
    cols.forEach((col) => {
      const tableId = `${databaseName}.${col.table_name}`;
      if (col.description && this.tableInfos[tableId]) {
        this.tableInfos[tableId].columnsCache[col.field].description =
          col.description;
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

module.exports = new PgSqlProvider();
