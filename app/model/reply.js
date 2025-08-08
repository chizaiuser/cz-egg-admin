module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const ReplySchema = new Schema({
    content: { type: String, required: true },
    commentId: { type: Schema.Types.ObjectId, ref: 'Comment', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: 'User' }, // 回复的目标用户
    createdAt: { type: Date, default: Date.now },
  });

  return mongoose.model('Reply', ReplySchema);
};