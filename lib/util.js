const path = require('path');
const fs = require('fs');

module.exports = {
    /**
     * 获取config文件
     */
    getConfig: function (fileName, callback) {
        fileName = fileName || 'code-gear.config.js';

        return new Promise((resolve, reject) => {
            var configPath = path.join(process.cwd(), fileName);
            var config = {};
            fs.stat(configPath, (statError, stats) => {
                if (statError) {
                    return reject(`{fileName} is not exists`);
                }
                fs.readFile(configPath, 'utf8', (readError, data) => {
                    if (readError) {
                        return reject(
                            `load file {fileName} occ error {readError}`
                        );
                    }

                    try {
                        config = eval(data);
                        resolve(config);
                    } catch (e) {
                        console.error(e);
                        return reject(`load file {fileName} occ error {e}`);
                    }
                });
            });
        });
    },
};
