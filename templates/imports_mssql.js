String.prototype.firstUpperCase = function () {
    if (!this) {
        return '';
    }
    return this.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
        return $1.toUpperCase() + $2.toLowerCase();
    });
};

module.exports = {
    toCamelCase: function (colName) {
        var arrParts = colName.split('_');
        var resArr = [];
        arrParts.forEach((a) => {
            resArr.push(a.firstUpperCase());
        });
        return resArr.join('');
    },
    formatMultilineComment: function (summary) {
        if (!summary) {
            return 'nothing~';
        }
        return summary.replace(/([\r\n]+)/gi, '\n\t\t/// ');
    },
    toCSharpType: function (c) {
        var IsClass = false;
        var csharpType = '';

        switch (c.dataType) {
            case 'image':
                csharpType = 'byte[]';
                break;
            case 'text':
                csharpType = 'string';
                break;
            case 'binary':
                csharpType = 'byte[]';
                break;
            case 'tinyint':
                csharpType = 'byte';
                break;
            case 'date':
                csharpType = 'DateTime';
                break;
            case 'time':
                csharpType = 'DateTime';
                break;
            case 'bit':
                csharpType = 'bool';
                break;
            case 'smallint':
                csharpType = 'short';
                break;
            case 'decimal':
                csharpType = 'decimal';
                break;
            case 'int':
                csharpType = 'int';
                break;
            case 'smalldatetime':
                csharpType = 'DateTime';
                break;
            case 'real':
                csharpType = 'float';
                break;
            case 'money':
                csharpType = 'decimal';
                break;
            case 'datetime':
                csharpType = 'DateTime';
                break;
            case 'float':
                csharpType = 'double';
                break;
            case 'numeric':
                csharpType = 'decimal';
                break;
            case 'smallmoney':
                csharpType = 'decimal';
                break;
            case 'datetime2':
                csharpType = 'DateTime';
                break;
            case 'bigint':
                csharpType = 'long';
                break;
            case 'varbinary':
                csharpType = 'byte[]';
                break;
            case 'timestamp':
                csharpType = 'byte[]';
                break;
            case 'sysname':
                csharpType = 'string';
                break;
            case 'nvarchar':
                csharpType = 'string';
                break;
            case 'varchar':
                csharpType = 'string';
                break;
            case 'ntext':
                csharpType = 'string';
                break;
            case 'uniqueidentifier':
                csharpType = 'Guid';
                break;
            case 'datetimeoffset':
                csharpType = 'DateTimeOffset';
                break;
            case 'sql_variant':
                csharpType = 'object';
                break;
            case 'xml':
                csharpType = 'string';
                break;

            case 'char':
                csharpType = c.length == 1 ? 'char' : 'string';
                break;

            case 'nchar':
                csharpType = c.length == 1 ? 'char' : 'string';
                break;

            //hierarchyid
            //geometry
            //geography
            default:
                csharpType = 'byte[]';
                break;
        }

        switch (csharpType) {
            case 'string':
            case 'byte[]':
                IsClass = true;
                break;
        }

        if (c.isNullable && !IsClass) csharpType += '?';

        return csharpType;
    },
};
