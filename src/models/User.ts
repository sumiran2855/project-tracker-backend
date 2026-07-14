import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['Employee', 'Admin', 'Manager', 'Team Lead', 'Client'],
      default: 'Employee',
    },
    resetToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    resetTokenExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        const r = ret as any;
        delete r.passwordHash;
        if (r._id) {
          r.id = r._id.toString();
        }
        delete r._id;
        delete r.__v;
        return r;
      },
    },
  }
);

export const User = model<IUser>('User', UserSchema);
export default User;
