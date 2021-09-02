#! /usr/bin/env node

const program = require('commander'),
    codeGear = require('../lib/index');

program
    .version('1.0.1')
    .option('-c, --config [config]', '配置文件名称', 'code-gear.config.js')
    .description('生成数据库实体类')
    .parse(process.argv);

codeGear.generate(program.config);
