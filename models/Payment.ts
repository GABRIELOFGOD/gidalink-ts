import mongoose, { Document, Schema, Model } from 'mongoose';

interface IPaymentDoc extends Document {
  payer: mongoose.Types.ObjectId; recipient: mongoose.Types.ObjectId;
  listing?: mongoose.Types.ObjectId; amount: number; platformFee: number;
  netAmount: number; type: 'rent'|'boost'; status: 'pending'|'success'|'failed'|'refunded';
  paystackReference: string; paystackData: Record<string,unknown>;
  boostDuration: number; description: string;
  createdAt: Date; updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDoc>(
  { payer: { type: Schema.Types.ObjectId, ref: 'User', required: true }, recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true }, listing: { type: Schema.Types.ObjectId, ref: 'Listing', default: null }, amount: { type: Number, required: true }, platformFee: { type: Number, required: true }, netAmount: { type: Number, required: true }, type: { type: String, enum: ['rent','boost'], required: true }, status: { type: String, enum: ['pending','success','failed','refunded'], default: 'pending' }, paystackReference: { type: String, required: true, unique: true }, paystackData: { type: Schema.Types.Mixed, default: {} }, boostDuration: { type: Number, default: 0 }, description: { type: String, default: '' } },
  { timestamps: true }
);
PaymentSchema.index({ payer: 1, createdAt: -1 }); PaymentSchema.index({ recipient: 1, createdAt: -1 }); PaymentSchema.index({ paystackReference: 1 });

const Payment: Model<IPaymentDoc> = (mongoose.models.Payment as Model<IPaymentDoc>) ?? mongoose.model<IPaymentDoc>('Payment', PaymentSchema);
export default Payment;
