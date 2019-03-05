#! /usr/bin/env node

const program = require('commander'),
  chalk = require('chalk'),
  codeGear = require('../lib/index');

program
  .version('1.0.0')  
  .description('生成数据库实体类')
  .action(function(option) {
    //option.w
    //and codeGear Some thing   
    codeGear.generate();
  
  });

program.parse(process.argv);