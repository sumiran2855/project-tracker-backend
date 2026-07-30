import { UserRepository } from '../repositories/UserRepository.js';
import { ProjectRepository } from '../repositories/ProjectRepository.js';
import { CustomError } from '../helpers/CustomError.js';
import { Types } from 'mongoose';
import { User } from '../models/User.js';

export class ManagerService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly projectRepository: ProjectRepository
  ) {}

  async getManagers(): Promise<any[]> {
    const managers = await this.userRepository.find({ role: 'Manager' });
    const allAssigned = await this.userRepository.find({ manager: { $ne: null } });
    const allProjects = await this.projectRepository.find({});

    const results = [];
    for (const manager of managers) {
      const assignedUsers = allAssigned.filter(
        (u) => u.manager && u.manager.toString() === manager._id.toString()
      );
      
      const employees = assignedUsers.filter((u) => u.role === 'Employee').map(u => {
        const userProjects = allProjects.filter(p =>
          p.members.some((m: any) => m.userId.toString() === u._id.toString())
        );
        return {
          id: u.id || u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          projects: userProjects.map(p => ({ id: p.id || p._id.toString(), name: p.name, status: p.status }))
        };
      });

      const teamLeads = assignedUsers.filter((u) => u.role === 'Team Lead').map(u => {
        const userProjects = allProjects.filter(p =>
          p.members.some((m: any) => m.userId.toString() === u._id.toString())
        );
        return {
          id: u.id || u._id.toString(),
          name: u.name,
          email: u.email,
          role: u.role,
          projects: userProjects.map(p => ({ id: p.id || p._id.toString(), name: p.name, status: p.status }))
        };
      });

      results.push({
        id: manager.id || manager._id.toString(),
        name: manager.name,
        email: manager.email,
        role: manager.role,
        employees,
        teamLeads,
      });
    }

    return results;
  }

  async getManagerDetails(managerId: string): Promise<any> {
    const manager = await this.userRepository.findById(managerId);
    if (!manager || manager.role !== 'Manager') {
      throw new CustomError(404, 'Manager not found');
    }

    const assignedUsers = await this.userRepository.find({ manager: manager._id });
    const allProjects = await this.projectRepository.find({});

    const employees = assignedUsers.filter((u) => u.role === 'Employee').map(u => {
      const userProjects = allProjects.filter(p =>
        p.members.some((m: any) => m.userId.toString() === u._id.toString())
      );
      return {
        id: u.id || u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        projects: userProjects.map(p => ({ id: p.id || p._id.toString(), name: p.name, status: p.status }))
      };
    });

    const teamLeads = assignedUsers.filter((u) => u.role === 'Team Lead').map(u => {
      const userProjects = allProjects.filter(p =>
        p.members.some((m: any) => m.userId.toString() === u._id.toString())
      );
      return {
        id: u.id || u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        projects: userProjects.map(p => ({ id: p.id || p._id.toString(), name: p.name, status: p.status }))
      };
    });

    return {
      id: manager.id || manager._id.toString(),
      name: manager.name,
      email: manager.email,
      role: manager.role,
      employees,
      teamLeads,
    };
  }

  async updateAssignments(
    managerId: string,
    employeeIds: string[],
    teamLeadIds: string[]
  ): Promise<void> {
    const manager = await this.userRepository.findById(managerId);
    if (!manager || manager.role !== 'Manager') {
      throw new CustomError(404, 'Manager not found');
    }

    const allIds = [...employeeIds, ...teamLeadIds];

    // Validate that all target users exist and are either Employee or Team Lead
    if (allIds.length > 0) {
      const objectIds = allIds.map((id) => new Types.ObjectId(id));
      const targetUsers = await User.find({ _id: { $in: objectIds } });
      for (const u of targetUsers) {
        if (u.role !== 'Employee' && u.role !== 'Team Lead') {
          throw new CustomError(400, `User ${u.name} is not an Employee or Team Lead`);
        }
      }
    }

    // Unassign users previously assigned to this manager
    await User.updateMany({ manager: manager._id }, { $set: { manager: null } });

    // Assign the new lists of users
    if (allIds.length > 0) {
      const objectIds = allIds.map((id) => new Types.ObjectId(id));
      await User.updateMany(
        { _id: { $in: objectIds } },
        { $set: { manager: manager._id } }
      );
    }
  }

  async getManagerTeam(managerId: string): Promise<any[]> {
    const managerObjectId = new Types.ObjectId(managerId);
    const assignedUsers = await this.userRepository.find({ manager: managerObjectId });
    const allProjects = await this.projectRepository.find({});

    return assignedUsers.map((u) => {
      const userProjects = allProjects.filter((p) =>
        p.members.some((m: any) => m.userId.toString() === u._id.toString())
      );

      return {
        id: u.id || u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        status: 'Active',
        skills: u.skills || [],
        projects: userProjects.map((p) => ({
          id: p.id || p._id.toString(),
          name: p.name,
          status: p.status,
        })),
        totalProjects: userProjects.length,
      };
    });
  }
}
