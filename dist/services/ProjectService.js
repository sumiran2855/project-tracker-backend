import { CustomError } from '../helpers/CustomError.js';
import { Types } from 'mongoose';
import { User } from '../models/User.js';
export class ProjectService {
    projectRepository;
    constructor(projectRepository) {
        this.projectRepository = projectRepository;
    }
    mapMembers(members) {
        const bgColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-blue-500'];
        return members.map((m) => {
            let hash = 0;
            const name = m.name || '';
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
            const index = Math.abs(hash) % bgColors.length;
            return {
                userId: new Types.ObjectId(m.userId),
                name: name,
                initials: m.initials || name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) || 'M',
                bg: m.bg || bgColors[index],
                role: m.role || 'Employee',
            };
        });
    }
    async createProject(projectData, owner) {
        const ownerId = new Types.ObjectId(owner.id);
        // Map members list
        let memberList = [];
        if (projectData.members && Array.isArray(projectData.members)) {
            memberList = this.mapMembers(projectData.members);
        }
        const isCreatorManager = owner.role?.toLowerCase() === 'manager';
        const managerId = isCreatorManager
            ? ownerId
            : (projectData.managerId ? new Types.ObjectId(projectData.managerId) : undefined);
        const teamLeadId = projectData.teamLeadId ? new Types.ObjectId(projectData.teamLeadId) : undefined;
        const clientId = projectData.clientId ? new Types.ObjectId(projectData.clientId) : undefined;
        // Enforce Manager Team Boundaries
        if (isCreatorManager) {
            if (teamLeadId) {
                const tlUser = await User.findById(teamLeadId);
                if (!tlUser || tlUser.role !== 'Team Lead' || tlUser.manager?.toString() !== owner.id) {
                    throw new CustomError(400, 'The selected Team Lead is not assigned to you.');
                }
            }
            if (memberList.length > 0) {
                const memberUserIds = memberList.map((m) => new Types.ObjectId(m.userId));
                const dbMembers = await User.find({ _id: { $in: memberUserIds } });
                for (const dbMember of dbMembers) {
                    const role = dbMember.role?.toLowerCase();
                    if (role === 'employee' || role === 'team lead') {
                        if (dbMember.manager?.toString() !== owner.id) {
                            throw new CustomError(400, `Member "${dbMember.name}" is not assigned to your team.`);
                        }
                    }
                }
            }
        }
        // Fetch users for manager, team lead, and client if provided
        const userIdsToFetch = [];
        if (managerId)
            userIdsToFetch.push(managerId);
        if (teamLeadId)
            userIdsToFetch.push(teamLeadId);
        if (clientId)
            userIdsToFetch.push(clientId);
        if (userIdsToFetch.length > 0) {
            const fetchedUsers = await User.find({ _id: { $in: userIdsToFetch } });
            const bgColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-blue-500'];
            for (const u of fetchedUsers) {
                if (!memberList.some(m => m.userId.toString() === u._id.toString())) {
                    const initials = u.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
                    let hash = 0;
                    for (let i = 0; i < u.name.length; i++) {
                        hash = u.name.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const index = Math.abs(hash) % bgColors.length;
                    memberList.push({
                        userId: u._id,
                        name: u.name,
                        initials,
                        bg: bgColors[index],
                        role: u.role
                    });
                }
            }
        }
        // Make sure owner is in the members list
        if (!memberList.some(m => m.userId.toString() === owner.id)) {
            const ownerUser = await User.findById(owner.id);
            memberList.push({
                userId: ownerId,
                name: owner.name,
                initials: owner.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U',
                bg: 'bg-indigo-500',
                role: ownerUser?.role || 'Admin',
            });
        }
        return this.projectRepository.create({
            name: projectData.name,
            description: projectData.description,
            status: projectData.status || 'Planning',
            progress: projectData.progress || 0,
            tags: projectData.tags,
            dueDate: projectData.dueDate,
            priority: projectData.priority,
            techStack: projectData.techStack,
            budget: projectData.budget,
            repositoryUrl: projectData.repositoryUrl,
            slackChannel: projectData.slackChannel,
            startDate: projectData.startDate,
            targetQuarter: projectData.targetQuarter,
            ownerId,
            managerId,
            teamLeadId,
            clientId,
            members: memberList,
        });
    }
    async getProjectsForUser(userId, role) {
        const userObjectId = new Types.ObjectId(userId);
        const normalizedRole = role ? role.toLowerCase() : '';
        if (normalizedRole === 'admin') {
            return this.projectRepository.find({});
        }
        const query = {};
        if (normalizedRole === 'manager') {
            query.$or = [
                { managerId: userObjectId },
                { ownerId: userObjectId },
                { 'members.userId': userObjectId }
            ];
        }
        else if (normalizedRole === 'team lead') {
            query.$or = [
                { teamLeadId: userObjectId },
                { ownerId: userObjectId },
                { 'members.userId': userObjectId }
            ];
        }
        else if (normalizedRole === 'client') {
            query.$or = [
                { clientId: userObjectId },
                { ownerId: userObjectId },
                { 'members.userId': userObjectId }
            ];
        }
        else {
            // Employees and other roles
            query.$or = [
                { ownerId: userObjectId },
                { 'members.userId': userObjectId }
            ];
        }
        return this.projectRepository.find(query);
    }
    async getProjectById(projectId, userId, role) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new CustomError(404, 'Project not found');
        }
        const normalizedRole = role ? role.toLowerCase() : '';
        if (normalizedRole === 'admin') {
            return project;
        }
        let hasAccess = false;
        const userObjectIdStr = userId.toString();
        if (normalizedRole === 'manager') {
            hasAccess = (project.managerId?.toString() === userObjectIdStr) || (project.ownerId.toString() === userObjectIdStr) || project.members.some(m => m.userId.toString() === userObjectIdStr);
        }
        else if (normalizedRole === 'team lead') {
            hasAccess = (project.teamLeadId?.toString() === userObjectIdStr) || (project.ownerId.toString() === userObjectIdStr) || project.members.some(m => m.userId.toString() === userObjectIdStr);
        }
        else if (normalizedRole === 'client') {
            hasAccess = (project.clientId?.toString() === userObjectIdStr) || (project.ownerId.toString() === userObjectIdStr) || project.members.some(m => m.userId.toString() === userObjectIdStr);
        }
        else {
            hasAccess = (project.ownerId.toString() === userObjectIdStr) || project.members.some(m => m.userId.toString() === userObjectIdStr);
        }
        if (!hasAccess) {
            throw new CustomError(403, 'Access denied');
        }
        return project;
    }
    async updateProject(projectId, userId, role, updateData) {
        // Verify access first
        const existingProject = await this.getProjectById(projectId, userId, role);
        const isManager = role?.toLowerCase() === 'manager';
        const managerId = isManager
            ? new Types.ObjectId(userId)
            : (updateData.managerId ? new Types.ObjectId(updateData.managerId) : undefined);
        const teamLeadId = updateData.teamLeadId ? new Types.ObjectId(updateData.teamLeadId) : undefined;
        const clientId = updateData.clientId ? new Types.ObjectId(updateData.clientId) : undefined;
        let memberList = [];
        if (updateData.members && Array.isArray(updateData.members)) {
            memberList = this.mapMembers(updateData.members);
        }
        else {
            memberList = existingProject.members || [];
        }
        // Enforce Manager Team Boundaries on Update
        if (isManager) {
            if (teamLeadId) {
                const tlUser = await User.findById(teamLeadId);
                if (!tlUser || tlUser.role !== 'Team Lead' || tlUser.manager?.toString() !== userId) {
                    throw new CustomError(400, 'The selected Team Lead is not assigned to you.');
                }
            }
            if (memberList.length > 0) {
                const memberUserIds = memberList.map((m) => new Types.ObjectId(m.userId));
                const dbMembers = await User.find({ _id: { $in: memberUserIds } });
                for (const dbMember of dbMembers) {
                    const mRole = dbMember.role?.toLowerCase();
                    if (mRole === 'employee' || mRole === 'team lead') {
                        if (dbMember.manager?.toString() !== userId) {
                            throw new CustomError(400, `Member "${dbMember.name}" is not assigned to your team.`);
                        }
                    }
                }
            }
        }
        const userIdsToFetch = [];
        if (managerId)
            userIdsToFetch.push(managerId);
        if (teamLeadId)
            userIdsToFetch.push(teamLeadId);
        if (clientId)
            userIdsToFetch.push(clientId);
        if (userIdsToFetch.length > 0) {
            const fetchedUsers = await User.find({ _id: { $in: userIdsToFetch } });
            const bgColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-blue-500'];
            for (const u of fetchedUsers) {
                if (!memberList.some(m => m.userId.toString() === u._id.toString())) {
                    const initials = u.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
                    let hash = 0;
                    for (let i = 0; i < u.name.length; i++) {
                        hash = u.name.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const index = Math.abs(hash) % bgColors.length;
                    memberList.push({
                        userId: u._id,
                        name: u.name,
                        initials,
                        bg: bgColors[index],
                        role: u.role
                    });
                }
            }
        }
        updateData.members = memberList;
        if (managerId)
            updateData.managerId = managerId;
        if (teamLeadId)
            updateData.teamLeadId = teamLeadId;
        if (clientId)
            updateData.clientId = clientId;
        return this.projectRepository.update(projectId, updateData);
    }
    async deleteProject(projectId, userId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new CustomError(404, 'Project not found');
        }
        if (project.ownerId.toString() !== userId) {
            throw new CustomError(403, 'Only project owner can delete the project');
        }
        return this.projectRepository.delete(projectId);
    }
    async addMember(projectId, userId, newMemberUser) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            throw new CustomError(404, 'Project not found');
        }
        if (project.ownerId.toString() !== userId) {
            throw new CustomError(403, 'Only project owner can manage members');
        }
        if (project.members.some(m => m.userId.toString() === newMemberUser.id)) {
            throw new CustomError(400, 'User is already a project member');
        }
        const member = {
            userId: new Types.ObjectId(newMemberUser.id),
            name: newMemberUser.name,
            initials: newMemberUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U',
            bg: 'bg-emerald-500',
        };
        project.members.push(member);
        await project.save();
        return project;
    }
}
