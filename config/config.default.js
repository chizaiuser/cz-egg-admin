/* eslint valid-jsdoc: "off" */

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1754559293966_2950';

  // add your middleware config here
  config.middleware = [];
  // ... existing code ...
  // 添加MongoDB配置
  config.mongoose = {
    client: {
      url: 'mongodb://127.0.0.1:27017/egg-demo', // 数据库连接地址
      options: {},
    },
  };
  config.session = {
    key: 'EGG_SESS',
    maxAge: 24 * 3600 * 1000, // 1天
    httpOnly: true,
    encrypt: true,
  };

  config.email = {
    service: 'QQ', // 邮箱服务提供商，如QQ、163、Gmail等
    auth: {
      user: 'your-email@example.com', // 你的邮箱地址
      pass: 'your-email-password-or-app-password', // 你的邮箱密码或应用专用密码
    },
  };
  // ... existing code ...
  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  return {
    ...config,
    ...userConfig,
  };
};
