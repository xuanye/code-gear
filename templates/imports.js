String.prototype.firstUpperCase = function(){
    if(!this){
        return "";
    }
    return this.replace(/\b(\w)(\w*)/g, function($0, $1, $2) {
        return $1.toUpperCase() + $2.toLowerCase();
    });
}

module.exports = {
    toCamelCase : function(colName){
        var arrParts = colName.split('_');
        var resArr = [];
        arrParts.forEach( a=>{
            resArr.push(a.firstUpperCase());
        })
        return resArr.join("");
    },
    formatMulilineSummary : function(summary){
      
        if(!summary){
            return "没写注释";
        }
      
        return summary.replace(/([\r\n]+)/ig,"\n\t\t/// ");
    },
    toCSharpType : function(c){
       
        var IsClass = false;
        var csharpType = "";
        var columnType =  c.columnType || "unknown";
        var unsigned  = columnType.indexOf("unsigned")>=0;
        switch (c.dataType)
        {
            case "varchar"   :
            case "mediumtext" :
            case "tinytext"   :
            case "text"       : csharpType = "string";  break;
            case "binary"     : csharpType = "byte[]";     break;
            case "date"       : csharpType = "DateTime";     break;
            case "time"       : csharpType = "DateTime";      break;
            case "bit"        : csharpType = "bool";      break;
            case "numeric"    :
            case "decimal"    :
            case "dec"        :
            case "fixed"      : csharpType = "decimal";    break;
            case "datetime"   : csharpType = "DateTime"; break;
            case "float"      : csharpType = "float";        break;
            case "double"     : csharpType = "double";      break;
            case "varbinary"  : csharpType = "byte[]";    break;
            case "varchar"    : csharpType = "string";     break;
            case "year"       : csharpType = "DateTime";    break;
            case "enum"       :
            case "set"        : csharpType = "string";   break;
            case "bool"       :
            case "boolean"    : csharpType = "bool";      break;
            case "serial"     : csharpType = "ulong";     break;
            case "mediumblob" :
            case "longblob"   :
            case "blob"       : csharpType = "byte[]";    break;
            case "tinyblob"   : csharpType = "byte[]";      break;

            case "smallint"   : csharpType = unsigned    ? "ushort" : "short"; break;
            case "mediumint"  :
            case "int"        :
            case "integer"    : csharpType = unsigned    ? "uint"  : "int";      break;
            case "real"       : csharpType = "double";   break;
            case "bigint"     : csharpType = unsigned    ? "ulong" : "long";   break;
            case "char"       : csharpType = "string";   break;
            case "timestamp"  :
                csharpType = "DateTime";               
                break;
            case "tinyint"    :
                if(columnType == "tinyint(1)")
                {
                    csharpType = "bool";                  
                }
                else
                {
                    csharpType = unsigned ? "byte" : "sbyte";                  
                }
                break;
            default :
                console.error("unknown dataType",c.dataType)
                break;
        }

        switch (csharpType)
        {
            case "string" :
            case "byte[]" : IsClass = true; break;
        }

        if (c.isNullable && !IsClass)
            csharpType += "?";

        return csharpType;
    }
};