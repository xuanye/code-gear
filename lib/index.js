const util = require('./util');
const chalk = require('chalk');
const mysql = require('./mysqlClient');
const schema = require('./dbSchema');
const path = require('path');
const _ = require('lodash');
const art = require('art-template');
const fs  =require('fs');
const gear = module.exports;
const rimraf = require('rimraf');

gear.generate = function(){    
    chalk.green("---------start------------");
    util.getConfig( (c)=>{
        mysql.config({'master':c.database});

        var templateCfg = c.template;
        if(templateCfg == null || ! templateCfg.templates ){
            halk.red("模板信息没有配置");
            process.exit(-1);
            return;
        }

        if(templateCfg.imports){ //导入函数
            const importsFun = require( path.resolve(process.cwd(),templateCfg.imports ));
            art.defaults.imports =_.assign(art.defaults.imports,importsFun);
        }

        const templates = [];

        templateCfg.templates.forEach( template =>{
            template.file =  path.resolve(process.cwd(),template.path);
            templates.push(template);
        })
        if(!templateCfg.target){
            templateCfg.target = "./target";
        }
     
        const realPath =  path.resolve(process.cwd(),templateCfg.target);
        if(fs.existsSync(realPath)){
            rimraf.sync(realPath);
            //fs.rmdirSync(realPath);
        }
        fs.mkdirSync(realPath);
       
        schema.getSchema('ubap',(error,schema)=>{
            if(error){
                chalk.red("generate error:"+error);
                process.exit(-1);
                return;
            }
           
            templates.forEach( t =>{
                var filePartPath = "";
                var mdText ="";
                if(t.splitType == 0){

                    mdText = art(t.file,_.assign(schema,t.extend || {}));
                    if(  typeof( t.targetFile) == "function" ){
                        filePartPath = t.targetFile(schema);
                    } 
                    else if( typeof( t.targetFile) == "string"){
                        filePartPath = targetFile ;
                    }
                    else{
                        chalk.red("目标路径错误");
                        process.exit(-1);
                        return;
                    }
                    var rp =  path.resolve(realPath,filePartPath);
                    var filePath =path.dirname(rp);                           
                    if(!fs.existsSync(filePath)){
                        fs.mkdirSync(filePath);
                    }
                    fs.writeFileSync(rp,mdText);    
                }
                else{

                    for(var table in schema){                        
                        if(schema.hasOwnProperty(table)){
                            mdText = art(t.file,_.assign(schema[table],t.extend || {}));
                            //mdText ="abc";
                            if(  typeof( t.targetFile) == "function" ){
                                filePartPath = t.targetFile(schema[table]);
                            } 
                            else if( typeof( t.targetFile) == "string"){
                                filePartPath = targetFile ;
                            }
                            else{
                                chalk.red("目标路径错误");
                                process.exit(-1);
                                return;
                            }
                            var rp =  path.resolve(realPath,filePartPath);
                            var filePath =path.dirname(rp);
                           
                            if(!fs.existsSync(filePath)){
                                fs.mkdirSync(filePath);
                            }
                            chalk.green("---------"+rp+"------------");
                            fs.writeFileSync(rp,mdText);    
                        }
                    }

                }
            });
            //模板引擎
            process.exit(0);
        });
        chalk.green("---------end------------");
        //console.dir(c);
    });
}