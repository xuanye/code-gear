const path = require('path');
const fs = require('fs');


module.exports = {
  /**
   * 获取config文件
   */
  getConfig: function(fileName,callback) {
    fileName = fileName || 'code-gear.config.js';
    var configPath = path.join(process.cwd(), fileName);  
    var config = {};
    if (fs.existsSync(configPath)) {
      try {
        config = eval(fs.readFileSync(configPath, 'utf-8'));
        callback && callback(config);
      } catch (e) {
          console.error(e);
          console.log('读取'+fileName+'文件失败');
      }
    } else {
      console.log(fileName+'文件不存在，请检查后再试');
    }
  }
};
