const Controller = require('egg').Controller;

class ArticleController extends Controller {
  // 创建文章
  async create() {
    const { ctx } = this;
    const { title, content } = ctx.request.body;
    const userId = ctx.session.userId; // 假设用户已登录，session中存储了用户ID

    if (!userId) {
      ctx.status = 401;
      ctx.body = { message: '请先登录' };
      return;
    }

    const article = await ctx.model.Article.create({
      title,
      content,
      author: userId,
    });

    ctx.body = { message: '文章创建成功', article };
  }

  // 获取文章列表
  async list() {
    const { ctx } = this;
    const { page = 1, pageSize = 10 } = ctx.query;

    const articles = await ctx.model.Article.find()
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize))
      .sort({ createdAt: -1 })
      .populate('author', 'username email');

    const total = await ctx.model.Article.countDocuments();

    ctx.body = { articles, total, page: Number(page), pageSize: Number(pageSize) };
  }

  // 获取文章详情
  async detail() {
    const { ctx } = this;
    const { id } = ctx.params;

    const article = await ctx.model.Article.findById(id).populate('author', 'username email');
    if (!article) {
      ctx.status = 404;
      ctx.body = { message: '文章不存在' };
      return;
    }

    // 增加浏览量
    article.views += 1;
    await article.save();

    ctx.body = article;
  }

  // 更新文章
  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    const { title, content } = ctx.request.body;
    const userId = ctx.session.userId;

    const article = await ctx.model.Article.findById(id);
    if (!article) {
      ctx.status = 404;
      ctx.body = { message: '文章不存在' };
      return;
    }

    if (article.author.toString() !== userId) {
      ctx.status = 403;
      ctx.body = { message: '没有权限修改此文章' };
      return;
    }

    article.title = title;
    article.content = content;
    article.updatedAt = Date.now();
    await article.save();

    ctx.body = { message: '文章更新成功', article };
  }

  // 删除文章
  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;
    const userId = ctx.session.userId;

    const article = await ctx.model.Article.findById(id);
    if (!article) {
      ctx.status = 404;
      ctx.body = { message: '文章不存在' };
      return;
    }

    if (article.author.toString() !== userId) {
      ctx.status = 403;
      ctx.body = { message: '没有权限删除此文章' };
      return;
    }

    await article.deleteOne();
    // 同时删除相关评论和回复
    await ctx.model.Comment.deleteMany({ articleId: id });
    await ctx.model.Reply.deleteMany({ commentId: { $in: await ctx.model.Comment.find({ articleId: id }).distinct('_id') } });

    ctx.body = { message: '文章删除成功' };
  }
}

module.exports = ArticleController;