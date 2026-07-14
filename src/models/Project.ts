import { Schema, model, Document, Types } from 'mongoose';

export interface IProjectMember {
  userId: Types.ObjectId;
  name: string;
  initials: string;
  bg: string;
}

export interface IProject extends Document {
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'In Review' | 'Completed';
  progress: number;
  tags: string[];
  tasksCount: number;
  completedTasks: number;
  commentsCount: number;
  attachmentsCount: number;
  dueDate: string;
  members: IProjectMember[];
  ownerId: Types.ObjectId;
  techStack?: string[];
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  budget?: string;
  repositoryUrl?: string;
  slackChannel?: string;
  startDate?: string;
  targetQuarter?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: ['Planning', 'In Progress', 'In Review', 'Completed'],
      default: 'Planning',
    },
    progress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    tasksCount: {
      type: Number,
      default: 0,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    attachmentsCount: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: String,
      default: 'No Due Date',
    },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        initials: { type: String, required: true },
        bg: { type: String, required: true },
      },
    ],
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    techStack: {
      type: [String],
      default: [],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    budget: {
      type: String,
      default: '',
    },
    repositoryUrl: {
      type: String,
      default: '',
    },
    slackChannel: {
      type: String,
      default: '',
    },
    startDate: {
      type: String,
      default: '',
    },
    targetQuarter: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        const r = ret as any;
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

export const Project = model<IProject>('Project', ProjectSchema);
export default Project;
