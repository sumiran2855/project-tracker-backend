import { Schema, model, Document, Types } from 'mongoose';

export interface ITaskAssignee {
  userId: Types.ObjectId;
  name: string;
  initials: string;
  bg: string;
}

export interface ITask extends Document {
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'In Review' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  projectId: Types.ObjectId;
  projectName: string;
  dueDate: string;
  assignees: ITaskAssignee[];
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
      enum: ['Todo', 'In Progress', 'In Review', 'Completed'],
      default: 'Todo',
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High'],
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
