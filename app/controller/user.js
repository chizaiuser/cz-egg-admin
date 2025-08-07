const Controller = require('egg').Controller;
const svgCaptcha = require('svg-captcha');
const md5 = require('md5');

class UserController extends Controller {
  // ... 现有代码 ...

  // 生成图形验证码
  async captcha() {
    const { ctx } = this;
    const captcha = svgCaptcha.create({
      size: 4,
      ignoreChars: '0o1il',
      color: true,
      noise: 2,
      width: 100,
      height: 40
    });
    // 将验证码文本存储到session中
    ctx.session.captcha = captcha.text.toLowerCase();
    ctx.response.type = 'image/svg+xml';
    ctx.body = captcha.data;
  }

  // 发送邮箱验证码
  async sendEmailCode() {
    const { ctx } = this;
    const { email } = ctx.request.body;

    // 检查邮箱是否已注册
    const existingUser = await ctx.model.User.findOne({ email });
    if (existingUser) {
      ctx.status = 400;
      ctx.body = { message: '该邮箱已被注册' };
      return;
    }

    // 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // 存储验证码到session，设置5分钟过期
    ctx.session.emailCode = code;
    ctx.session.emailCodeExpire = Date.now() + 5 * 60 * 1000;

    try {
      // 调用邮箱服务发送验证码
      await ctx.app.utils.email.sendEmail({
        to: email,
        subject: '注册验证码',
        html: `<p>您的注册验证码是：<strong>${code}</strong></p><p>验证码有效期为5分钟，请尽快使用。</p>`,
      });

      ctx.body = { message: '验证码发送成功' };
    } catch (error) {
      console.error('发送验证码失败:', error);
      ctx.status = 500;
      ctx.body = { message: '发送验证码失败，请稍后重试' };
    }
  }

  // 修改注册方法
  async register() {
    const { ctx } = this;
    const { username, password, email, captcha, emailCode } = ctx.request.body;

    // 验证图形验证码
    if (!captcha || ctx.session.captcha !== captcha.toLowerCase()) {
      ctx.status = 400;
      ctx.body = { message: '图形验证码错误' };
      return;
    }

    // 验证邮箱验证码
    if (!emailCode || ctx.session.emailCode !== emailCode || Date.now() > ctx.session.emailCodeExpire) {
      ctx.status = 400;
      ctx.body = { message: '邮箱验证码错误或已过期' };
      return;
    }

    // 检查邮箱是否已注册
    const existingUser = await ctx.model.User.findOne({ email });
    if (existingUser) {
      ctx.status = 400;
      ctx.body = { message: '该邮箱已被注册' };
      return;
    }

    // 密码MD5加密
    const encryptedPassword = md5(password);

    // 创建用户
    const user = await ctx.model.User.create({
      username,
      password: encryptedPassword,
      email
    });

    // 清除session中的验证码
    delete ctx.session.captcha;
    delete ctx.session.emailCode;
    delete ctx.session.emailCodeExpire;

    ctx.body = { message: '注册成功', userId: user._id };
  }
}

module.exports = UserController;