const nodemailer = require('nodemailer');

module.exports = app => {
  // 创建邮件传输器
  const transporter = nodemailer.createTransport({
    service: app.config.email.service,
    auth: {
      user: app.config.email.auth.user,
      pass: app.config.email.auth.pass,
    },
  });

  /**
   * 发送邮件
   * @param {Object} options 邮件选项
   * @param {String} options.to 收件人邮箱
   * @param {String} options.subject 邮件主题
   * @param {String} options.html 邮件内容
   * @returns {Promise}
   */
  const sendEmail = async options => {
    const mailOptions = {
      from: app.config.email.auth.user,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  };

  return {
    sendEmail,
  };
};