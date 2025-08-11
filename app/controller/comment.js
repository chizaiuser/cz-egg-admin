const Controller = require('egg').Controller;

class CommentController extends Controller {
  // 创建评论
  async create() {
    const { ctx } = this;
    const { articleId, content } = ctx.request.body;
    const userId = ctx.session.userId;

    if (!userId) {
      ctx.status = 401;
      ctx.body = { message: '请先登录' };
      return;
    }

    // 检查文章是否存在
    const article = await ctx.model.Article.findById(articleId);
    if (!article) {
      ctx.status = 404;
      ctx.body = { message: '文章不存在' };
      return;
    }

    const comment = await ctx.model.Comment.create({
      content,
      articleId,
      userId,
    });

    // 关联用户信息
    const commentWithUser = await ctx.model.Comment.findById(comment._id).populate('userId', 'username email');

    ctx.body = { message: '评论成功', comment: commentWithUser };
  }

  // 获取文章的评论列表
  async list() {
    const { ctx } = this;
    const { articleId, page = 1, pageSize = 10 } = ctx.query;

    const comments = await ctx.model.Comment.find({ articleId })
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize))
      .sort({ createdAt: -1 })
      .populate('userId', 'username email');

    const total = await ctx.model.Comment.countDocuments({ articleId });

    ctx.body = { comments, total, page: Number(page), pageSize: Number(pageSize) };
  }

  // 删除评论
  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;
    const userId = ctx.session.userId;

    const comment = await ctx.model.Comment.findById(id);
    if (!comment) {
      ctx.status = 404;
      ctx.body = { message: '评论不存在' };
      return;
    }

    if (comment.userId.toString() !== userId) {
      ctx.status = 403;
      ctx.body = { message: '没有权限删除此评论' };
      return;
    }

    await comment.deleteOne();
    // 同时删除相关回复
    await ctx.model.Reply.deleteMany({ commentId: id });

    ctx.body = { message: '评论删除成功' };
  }
}

module.exports = CommentController;
