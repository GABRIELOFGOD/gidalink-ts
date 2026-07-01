import mongoose, { Document, Schema, Model } from 'mongoose';

interface IConversationDoc extends Document {
  participants: mongoose.Types.ObjectId[];
  listing?: mongoose.Types.ObjectId;
  lastMessage: string;
  lastMessageAt: Date;
  createdAt: Date; updatedAt: Date;
}

interface IMessageDoc extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  isRead: boolean;
  createdAt: Date; updatedAt: Date;
}

const ConvSchema = new Schema<IConversationDoc>(
  { participants: [{ type: Schema.Types.ObjectId, ref: 'User' }], listing: { type: Schema.Types.ObjectId, ref: 'Listing', default: null }, lastMessage: { type: String, default: '' }, lastMessageAt: { type: Date, default: Date.now } },
  { timestamps: true }
);
ConvSchema.index({ participants: 1 }); ConvSchema.index({ lastMessageAt: -1 });

const MsgSchema = new Schema<IMessageDoc>(
  { conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true }, sender: { type: Schema.Types.ObjectId, ref: 'User', required: true }, content: { type: String, required: true, maxlength: 2000 }, isRead: { type: Boolean, default: false } },
  { timestamps: true }
);
MsgSchema.index({ conversation: 1, createdAt: 1 });

export const Conversation: Model<IConversationDoc> = (mongoose.models.Conversation as Model<IConversationDoc>) ?? mongoose.model<IConversationDoc>('Conversation', ConvSchema);
export const Message: Model<IMessageDoc> = (mongoose.models.Message as Model<IMessageDoc>) ?? mongoose.model<IMessageDoc>('Message', MsgSchema);
