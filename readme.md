code-gear
----
根据Mysql数据库，生成实体等功能

## 1. 使用


### 1.1 安装code-gear

```
> npm i -g code-gear
```

### 1.2 编写 code-gear.config.js

以下是一个简单的实例,详见注释

```
module.exports = {
	"database":{ //配置要解析的数据库信息，暂时只支持MySQL
		"host": "127.0.0.1", 
		"port": 3306,      
		"database": "sampleDb",
		"user": "root",          
		"password": "123333@"
	},
	"template":{ //模板相关配置
		"imports":"./templates/imports.js", //导入函数的位置，注意是命令行执行路径的相对位置
		"target":"./.generate", //目标生成目录，每次生成都会被删除后重新生成
		"templates":[ //模板信息，可以配置多个
			{
				"splitType":1, // 1= table split每个table 一个文件 0 =所有的table 一个文件
				"path":"./templates/vulcanEntity.art",//相对的模板路径，使用art-template模板
			    "targetFile": function( t ){  //生成的目标文件名，可以是字符串或者是一个函数返回文件名
					var arrParts = t.tableName.split('_');
					var resArr = [];
					resArr.push("./");
					arrParts.forEach( a=>{
						if(!a){
							return "";
						}
						var s = a.replace(/\b(\w)(\w*)/g, function($0, $1, $2) {
							return $1.toUpperCase() + $2.toLowerCase();
						});
						resArr.push(s);
					})
					resArr.push(".cs");
					return resArr.join("");
				},
				"extend":{ //额外的变量，可以在模板中获取
					"nameSpace":"Sample.Impl.Model",
					"baseModel" :"Sample.Impl.Model.BaseModel"
				}
			}
		]
	}

}
```


### 1.3 编写模板中使用的格式化函数

可以在import.js中定义自己的格式化函数，如下所示，另外该文件中可以使用loadhash的所有方法，当然要引用哦

```
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
    }
};
```

### 1.4 编写模板文件
code-gear默认使用的是art-template模板，可通过这里获取详细语法说明

以下为模板文件
```
//---------------------------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated by code-gear.
//    Changes to this file may cause incorrect behavior and will be lost if the code is regenerated.
// </auto-generated>
//---------------------------------------------------------------------------------------------------
using System;
using System.Collections.Generic;
using Vulcan.DataAccess.ORMapping;

namespace {{nameSpace}}
{

	[TableName("{{tableName}}")]
	public partial class {{ tableName | toCamelCase }} : {{baseModel}}
	{ 
{{each columns col colIndex}}
		private {{col | toCSharpType}} _{{ col.name | toCamelCase }};
		/// <summary>
		/// {{col.description | formatMulilineSummary}}
		/// {{col.columnType}}
		/// </summary>	
        [MapField("{{col.name}}"){{if col.isNullable ==1 }},Nullable{{/if}}{{if col.isIdentity ==1 }},Identity{{/if}}{{if col.isPK ==1 }},PrimaryKey({{col.colid}}){{/if}}] 
		public {{col | toCSharpType}} {{ col.name | toCamelCase }}
		{ get{ return _{{ col.name | toCamelCase }}; } 	set{ _{{ col.name | toCamelCase }} = value ; OnPropertyChanged("{{col.name}}"); } }
{{/each}}
    }
}
```

实际生成的效果

```
//---------------------------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated by code-gear.
//    Changes to this file may cause incorrect behavior and will be lost if the code is regenerated.
// </auto-generated>
//---------------------------------------------------------------------------------------------------
using System;
using System.Collections.Generic;
using Vulcan.DataAccess.ORMapping;

namespace Sample.Impl.Model
{

	[TableName("bim_app_info")]
	public partial class BimAppInfo : Sample.Impl.Model.BaseModel
	{ 

		private string _AppCode;
		/// <summary>
		/// App代码
		/// varchar(50)
		/// </summary>	
        [MapField("app_code"),PrimaryKey(1)] 
		public string AppCode
		{ get{ return _AppCode; } 	set{ _AppCode = value ; OnPropertyChanged("app_code"); } }

		private string _AppName;
		/// <summary>
		/// 系统名称
		/// varchar(200)
		/// </summary>	
        [MapField("app_name")] 
		public string AppName
		{ get{ return _AppName; } 	set{ _AppName = value ; OnPropertyChanged("app_name"); } }

		private string _Description;
		/// <summary>
		/// 系统说明
		/// varchar(1000)
		/// </summary>	
        [MapField("description"),Nullable] 
		public string Description
		{ get{ return _Description; } 	set{ _Description = value ; OnPropertyChanged("description"); } }

		private string _AppAdmin;
		/// <summary>
		/// 系统负责人 负责人描述信息
		/// varchar(100)
		/// </summary>	
        [MapField("app_admin"),Nullable] 
		public string AppAdmin
		{ get{ return _AppAdmin; } 	set{ _AppAdmin = value ; OnPropertyChanged("app_admin"); } }

		private string _CreatorId;
		/// <summary>
		/// 创建人账号 创建人账号
		/// varchar(50)
		/// </summary>	
        [MapField("creator_id")] 
		public string CreatorId
		{ get{ return _CreatorId; } 	set{ _CreatorId = value ; OnPropertyChanged("creator_id"); } }

		private DateTime _CreateTime;
		/// <summary>
		/// 最后一次更新时间 创建时间
		/// datetime
		/// </summary>	
        [MapField("create_time")] 
		public DateTime CreateTime
		{ get{ return _CreateTime; } 	set{ _CreateTime = value ; OnPropertyChanged("create_time"); } }

		private string _ModifierId;
		/// <summary>
		/// 更新人账号 更新人账号
		/// varchar(50)
		/// </summary>	
        [MapField("modifier_id")] 
		public string ModifierId
		{ get{ return _ModifierId; } 	set{ _ModifierId = value ; OnPropertyChanged("modifier_id"); } }

		private DateTime _ModifyTime;
		/// <summary>
		/// 最后一次更新时间 最后一次更新时间
		/// datetime
		/// </summary>	
        [MapField("modify_time")] 
		public DateTime ModifyTime
		{ get{ return _ModifyTime; } 	set{ _ModifyTime = value ; OnPropertyChanged("modify_time"); } }

    }
}
```

### 1.5 在code-gear.config.js目录执行命令

```
> code-gear
```

或者指定配置文件

```
> code-gear -c code-gear.config.js
```