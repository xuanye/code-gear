const mssql = require('mssql');

class MSSQlClient {
    config(options) {
        this.options = Object.assign(
            {
                server: '127.0.0.1',
                port: 3306,
                database: 'sampleDb',
                user: 'root',
                password: '123333@',
            },
            options
        );
    }
    async query(sql) {
        // make sure that any items are correctly URL encoded in the connection string
        await mssql.connect(this.options);
        const results = await mssql.query(sql);
        return results.recordset;
    }
}

module.exports = new MSSQlClient();
