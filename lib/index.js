const chalk = require('chalk');
const art = require('art-template');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');

const util = require('./util');
class CodeGear {
    constructor() {
        //console.log('CodeGear Constructor');
        this.templates = [];
        this.generatePath = '';
    }

    async generate(configUrl) {
        console.log(chalk.green('---------start------------'));
        try {
            const config = await util.getConfig(configUrl);
            if (config.type != 'mysql' && config.type != 'mssql') {
                throw new Error(
                    `database type ${config.type} is not supported`
                );
            }
            this.prepareTemplates(config.template);

            const provider = require(`./${config.type}/index`);
            const schema = await provider.generate(config);

            this.generateCode(schema);

            console.log(chalk.green('---------end------------'));
            process.exit(0);
        } catch (error) {
            console.log(chalk.red(error.message));
            process.exit(-1);
        }
    }
    prepareTemplates(config) {
        if (config == null || !config.templates) {
            console.log(chalk.red('template config is not exist'));
            process.exit(-1);
            return;
        }

        if (config.imports) {
            const importsFun = require(path.resolve(
                process.cwd(),
                config.imports
            ));
            art.defaults.imports = _.assign(art.defaults.imports, importsFun);
        }

        config.templates.forEach((template) => {
            template.file = path.resolve(process.cwd(), template.path);
            this.templates.push(template);
        });
        if (!config.target) {
            config.target = './target';
        }

        const realPath = path.resolve(process.cwd(), config.target);
        if (fs.existsSync(realPath)) {
            rimraf.sync(realPath);
            //fs.rmdirSync(realPath);
        }
        mkdirp.sync(realPath);
        this.generatePath = realPath;
    }
    generateCode(schema) {
        //console.log('schema:');
        //console.dir(schema);
        this.templates.forEach((template) => {
            if (template.splitType == 0) {
                this.generateInOneFile(template, schema);
            } else {
                this.generateInEachFile(template, schema);
            }
        });
    }
    generateInOneFile(template, schema) {
        const mdText = art(
            template.file,
            _.assign({ tables: schema }, template.extend || {})
        );
        let filePartPath;
        if (typeof template.targetFile == 'function') {
            filePartPath = template.targetFile(schema);
        } else if (typeof template.targetFile == 'string') {
            filePartPath = template.targetFile;
        } else {
            console.log(chalk.red('target path error'));
            process.exit(-1);
        }

        var rp = path.resolve(this.generatePath, filePartPath);
        var filePath = path.dirname(rp);
        if (!fs.existsSync(filePath)) {
            mkdirp.sync(filePath);
        }
        fs.writeFileSync(rp, mdText);
    }
    generateInEachFile(template, schema) {
        let filePartPath;
        for (var table in schema) {
            //console.dir(table);
            if (schema.hasOwnProperty(table)) {
                const mdText = art(
                    template.file,
                    _.assign(schema[table], template.extend || {})
                );
                //mdText ="abc";
                if (typeof template.targetFile == 'function') {
                    filePartPath = template.targetFile(schema[table]);
                } else if (typeof template.targetFile == 'string') {
                    filePartPath = targetFile;
                } else {
                    console.log(chalk.red('目标路径错误'));
                    process.exit(-1);
                }
                var rp = path.resolve(this.generatePath, filePartPath);
                var filePath = path.dirname(rp);

                if (!fs.existsSync(filePath)) {
                    mkdirp.sync(filePath);
                }
                console.log(chalk.green('---------' + rp + '------------'));
                fs.writeFileSync(rp, mdText);
            }
        }
    }
}

module.exports = new CodeGear();
