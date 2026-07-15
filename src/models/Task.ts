import { Schema, model, Document, Types } from 'mongoose';

export interface ITaskAssignee {
  userId: Types.ObjectId;
  name: string;
  initials: string;
  bg: string;
}

export interface ISubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface IComment {
  id: string;
  author: string;
  initials: string;
  text: string;
  time: string;
}

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  projectId: Types.ObjectId;
  projectName: string;
  startDate: string;
  dueDate: string;
  assignees: ITaskAssignee[];
  subtasks: ISubtask[];
  comments: IComment[];
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
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
      enum: ['To Do', 'In Progress', 'In Review', 'Done'],
      default: 'To Do',
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      default: '',
    },
    dueDate: {
      type: String,
      default: '',
    },
    assignees: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        initials: { type: String, required: true },
        bg: { type: String, required: true },
      },
    ],
    subtasks: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        completed: { type: Boolean, required: true, default: false },
      },
    ],
    comments: [
      {
        id: { type: String, required: true },
        author: { type: String, required: true },
        initials: { type: String, required: true },
        text: { type: String, required: true },
        time: { type: String, required: true },
      },
    ],
    actualHours: {
      type: Number,
      default: 0,
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

export const Task = model<ITask>('Task', TaskSchema);
export default Task;

