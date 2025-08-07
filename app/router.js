/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.post('/api/users', controller.user.create);
  router.get('/api/users', controller.user.list);
  // 注册相关路由
  router.get('/api/captcha', controller.user.captcha);
  router.post('/api/send-email-code', controller.user.sendEmailCode);
  router.post('/api/register', controller.user.register);
};