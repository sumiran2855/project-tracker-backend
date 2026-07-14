import { Schema, model } from 'mongoose';
const IssueSchema = new Schema({
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
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open',
    },
    priority: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium',
    },
    type: {
        type: String,
        required: true,
        enum: ['Bug', 'Task', 'Improvement', 'Security'],
        default: 'Bug',
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
    commentsCount: {
        type: Number,
        default: 0,
    },
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
export const Issue = model('Issue', IssueSchema);
export default Issue;
