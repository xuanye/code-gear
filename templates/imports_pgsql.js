String.prototype.firstUpperCase = function () {
  if (!this) {
    return "";
  }
  return this.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
    return $1.toUpperCase() + $2.toLowerCase();
  });
};

module.exports = {
  toCamelCase: function (colName) {
    var arrParts = colName.split("_");
    var resArr = [];
    arrParts.forEach((a) => {
      resArr.push(a.firstUpperCase());
    });
    return resArr.join("");
  },
  formatMultilineComment: function (summary) {
    if (!summary) {
      return "nothing~";
    }

    return summary.replace(/([\r\n]+)/gi, "\n\t\t/// ");
  },
  toCSharpType: function (c) {
    var IsClass = false;
    var csharpType = "";
    var unsigned = false;
    switch (c.dataType) {
      case "varchar":
      case "longtext":
      case "mediumtext":
      case "tinytext":
      case "text":
      case "character varying":
        csharpType = "string";
        break;
      case "json":
      case "jsonb":
        csharpType = "JsonParameter";
        break;
      case "binary":
        csharpType = "byte[]";
        break;
      case "date":
        csharpType = "DateTime";
        break;
      case "time":
        csharpType = "DateTime";
        break;
      case "bit":
        csharpType = "bool";
        break;
      case "numeric":
      case "decimal":
      case "dec":
      case "fixed":
        csharpType = "decimal";
        break;
      case "datetime":
        csharpType = "DateTime";
        break;
      case "float":
        csharpType = "float";
        break;
      case "double":
        csharpType = "double";
        break;
      case "varbinary":
        csharpType = "byte[]";
        break;
      case "varchar":
        csharpType = "string";
        break;
      case "year":
        csharpType = "DateTime";
        break;
      case "enum":
      case "set":
        csharpType = "string";
        break;
      case "bool":
      case "boolean":
        csharpType = "bool";
        break;
      case "serial":
        csharpType = "ulong";
        break;
      case "mediumblob":
      case "longblob":
      case "blob":
        csharpType = "byte[]";
        break;
      case "tinyblob":
        csharpType = "byte[]";
        break;

      case "smallint":
        csharpType = unsigned ? "ushort" : "short";
        break;
      case "mediumint":
      case "int":
      case "integer":
        csharpType = unsigned ? "uint" : "int";
        break;
      case "real":
        csharpType = "double";
        break;
      case "bigint":
        csharpType = unsigned ? "ulong" : "long";
        break;
      case "char":
        csharpType = "string";
        break;
      case "timestamp":
      case "timestamp without time zone":
        csharpType = "DateTime";
        break;
      case "timestamptz":
      case "timestamp with time zone":
        csharpType = "DateTime";
        break;
      default:
        console.error("unknown dataType", c.dataType);
        break;
    }

    switch (csharpType) {
      case "string":
      case "byte[]":
        IsClass = true;
        break;
    }

    if (c.isNullable && !IsClass) csharpType += "?";

    return csharpType;
  },
};
