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
  router.post('/api/articles', controller.article.create);
  router.get('/api/articles', controller.article.list);
  router.get('/api/articles/:id', controller.article.detail);
  router.put('/api/articles/:id', controller.article.update);
  router.delete('/api/articles/:id', controller.article.destroy);

  // 评论相关路由
  router.post('/api/comments', controller.comment.create);
  router.get('/api/comments', controller.comment.list);
  router.delete('/api/comments/:id', controller.comment.destroy);

  // 回复相关路由
  router.post('/api/replies', controller.reply.create);
  router.get('/api/replies', controller.reply.list);
  router.delete('/api/replies/:id', controller.reply.destroy);
};