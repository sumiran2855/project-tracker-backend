import { Schema, model } from 'mongoose';
const UserSchema = new Schema({
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
}, {
    timestamps: true,
    toJSON: {
        transform: (_, ret) => {
            const r = ret;
            delete r.passwordHash;
            if (r._id) {
                r.id = r._id.toString();
            }
            delete r._id;
            delete r.__v;
            return r;
        },
    },
});
export const User = model('User', UserSchema);
export default User;
