const path = require('path');
const fs = require('fs');


module.exports = {
  /**
   * 获取config文件
   */
  getConfig: function(callback) {
    var configPath = path.join(process.cwd(), 'code-gear.config.js');
    console.log(configPath);
    var config = {};
    if (fs.existsSync(configPath)) {
      try {
        config = eval(fs.readFileSync(configPath, 'utf-8'));
        callback && callback(config);
      } catch (e) {
          console.error(e);
          console.log('读取code-gear.config.js文件失败');
      }
    } else {
      console.log('code-gear.config.js文件不存在，请检查后再试');
    }
  }
};
