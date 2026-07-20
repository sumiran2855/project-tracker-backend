import { Schema, model } from 'mongoose';
const TaskSchema = new Schema({
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
    workLogs: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
            userName: { type: String, default: '' },
            hours: { type: Number, required: true },
            date: { type: Date, default: Date.now },
        },
    ],
}, {
    timestamps: true,
    toJSON: {
        transform: (_, ret) => {
            const r = ret;
            if (r._id) {
                r.id = r._id.toString();
            }
            delete r._id;
            delete r.__v;
            return r;
        },
    },
});
export const Task = model('Task', TaskSchema);
export default Task;
