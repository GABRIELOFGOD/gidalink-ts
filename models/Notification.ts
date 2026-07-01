import mongoose, { Document, Schema, Model } from 'mongoose';

interface INotificationDoc extends Document {
  user: mongoose.Types.ObjectId; type: string; title: string;
  message: string; link: string; isRead: boolean;
  createdAt: Date; updatedAt: Date;
}

const NotifSchema = new Schema<INotificationDoc>(
  { user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, type: { type: String, required: true }, title: { type: String, required: true }, message: { type: String, required: true }, link: { type: String, default: '' }, isRead: { type: Boolean, default: false } },
  { timestamps: true }
);
NotifSchema.index({ user: 1, createdAt: -1 }); NotifSchema.index({ user: 1, isRead: 1 });

const Notification: Model<INotificationDoc> = (mongoose.models.Notification as Model<INotificationDoc>) ?? mongoose.model<INotificationDoc>('Notification', NotifSchema);
export default Notification;
