import { Schema, model, Document } from 'mongoose';

export interface IClientInvite extends Document {
  token: string;
  isUsed: boolean;
  usedByEmail?: string;
  expiresAt: Date;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClientInviteSchema = new Schema<IClientInvite>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    isUsed: {
      type: Boolean,
      required: true,
      default: false,
    },
    usedByEmail: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ClientInvite = model<IClientInvite>('ClientInvite', ClientInviteSchema);
