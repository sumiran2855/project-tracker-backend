import { Schema, model, Document } from 'mongoose';

export interface ICollaborator {
  name: string;
  initials: string;
  bg: string;
  role: string;
  email: string;
  status: 'Pending' | 'Accepted';
}

export interface INotificationPrefs {
  emailTasks: boolean;
  emailDueDates: boolean;
  emailDigests: boolean;
  pushMentions: boolean;
  pushStatusChanges?: boolean;
  soundAlerts: boolean;
}

export interface IWorkspacePrefs {
  defaultView: string;
  theme: 'light' | 'dark' | 'system';
  weekStart: 'Sunday' | 'Monday';
  accentTint: string;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  readNotifications?: string[];
  deletedNotifications?: string[];
  skills?: string[];
  location?: string;
  department?: string;
  lastLogin?: Date;
  collaborators?: ICollaborator[];
  notificationPrefs?: INotificationPrefs;
  workspacePrefs?: IWorkspacePrefs;
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
    readNotifications: {
      type: [String],
      default: [],
    },
    deletedNotifications: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    collaborators: {
      type: [
        {
          name: { type: String, required: true },
          initials: { type: String, required: true },
          bg: { type: String, required: true },
          role: { type: String, required: true },
          email: { type: String, required: true },
          status: { type: String, required: true, enum: ['Pending', 'Accepted'], default: 'Pending' },
        },
      ],
      default: [],
    },
    notificationPrefs: {
      type: {
        emailTasks: { type: Boolean, default: true },
        emailDueDates: { type: Boolean, default: true },
        emailDigests: { type: Boolean, default: false },
        pushMentions: { type: Boolean, default: true },
        pushStatusChanges: { type: Boolean, default: false },
        soundAlerts: { type: Boolean, default: true },
      },
      default: () => ({
        emailTasks: true,
        emailDueDates: true,
        emailDigests: false,
        pushMentions: true,
        pushStatusChanges: false,
        soundAlerts: true,
      }),
    },
    workspacePrefs: {
      type: {
        defaultView: { type: String, default: 'Dashboard' },
        theme: { type: String, default: 'light' },
        weekStart: { type: String, default: 'Monday' },
        accentTint: { type: String, default: '#6366f1' },
      },
      default: () => ({
        defaultView: 'Dashboard',
        theme: 'light',
        weekStart: 'Monday',
        accentTint: '#6366f1',
      }),
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
