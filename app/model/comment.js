module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const CommentSchema = new Schema({
    content: { type: String, required: true },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  });

  return mongoose.model('Comment', CommentSchema);
};