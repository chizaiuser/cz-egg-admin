const Controller = require('egg').Controller;

class ReplyController extends Controller {
  // 创建回复
  async create() {
    const { ctx } = this;
    const { commentId, content, toUserId } = ctx.request.body;
    const userId = ctx.session.userId;

    if (!userId) {
      ctx.status = 401;
      ctx.body = { message: '请先登录' };
      return;
    }

    // 检查评论是否存在
    const comment = await ctx.model.Comment.findById(commentId);
    if (!comment) {
      ctx.status = 404;
      ctx.body = { message: '评论不存在' };
      return;
    }

    const reply = await ctx.model.Reply.create({
      content,
      commentId,
      userId,
      toUserId,
    });

    // 关联用户信息
    const replyWithUser = await ctx.model.Reply.findById(reply._id)
      .populate('userId', 'username email')
      .populate('toUserId', 'username email');

    ctx.body = { message: '回复成功', reply: replyWithUser };
  }

  // 获取评论的回复列表
  async list() {
    const { ctx } = this;
    const { commentId, page = 1, pageSize = 10 } = ctx.query;

    const replies = await ctx.model.Reply.find({ commentId })
      .skip((page - 1) * pageSize)
      .limit(Number(pageSize))
      .sort({ createdAt: -1 })
      .populate('userId', 'username email')
      .populate('toUserId', 'username email');

    const total = await ctx.model.Reply.countDocuments({ commentId });

    ctx.body = { replies, total, page: Number(page), pageSize: Number(pageSize) };
  }

  // 删除回复
  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;
    const userId = ctx.session.userId;

    const reply = await ctx.model.Reply.findById(id);
    if (!reply) {
      ctx.status = 404;
      ctx.body = { message: '回复不存在' };
      return;
    }

    if (reply.userId.toString() !== userId) {
      ctx.status = 403;
      ctx.body = { message: '没有权限删除此回复' };
      return;
    }

    await reply.deleteOne();

    ctx.body = { message: '回复删除成功' };
  }
}

module.exports = ReplyController;