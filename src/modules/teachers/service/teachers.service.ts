import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Role } from 'src/auth/models/roles.model'
import { Collections } from 'src/modules/history/models/collections.model'
import { HistoryService } from 'src/modules/history/service/history.service'
import { UpdateUserDTO, UserDTO } from 'src/modules/users/dtos/user.dto'
import { UsersService } from 'src/modules/users/services/users/users.service'
import { Teacher } from '../entities/teacher.entity'

@Injectable()
export class TeachersService {
    constructor(
        @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
        private historyService: HistoryService,
        private usersService: UsersService,
    ) {}

    private async getImpartTeacher(teacherId: string) {
        return await this.teacherModel
            .findById(teacherId)
            .populate('impart.subject', { subject: 1 })
            .populate('impart.course', { section: 1 })
            .exec()
    }

    async getTeachers(
        search?: string,
        skip?: number,
        limit?: number,
        total = false,
    ) {
        return await this.usersService
            .getUsers(
                {
                    user_type: Role.TEACHER,
                },
                {
                    password: 0,
                },
                {
                    status: -1,
                    name: 1,
                },
                search,
                limit,
                skip,
                total,
            )
            .then(async (users) => {
                const teachers = await Promise.all(
                    users.users.map(async (user) => {
                        const { imparted } = await this.getImpartTeacher(
                            user._id.toString(),
                        )
                        return {
                            ...user,
                            imparted,
                        }
                    }),
                )
                return {
                    users: teachers,
                    total: users.total,
                }
            })
    }

    async createTeacher(teacher: UserDTO, user_id: string) {
        const newUser = await this.usersService.createUser({
            ...teacher,
            user_type: Role.TEACHER,
        })
        const newTeacher = new this.teacherModel({
            user: newUser._id.toString(),
        })
        this.historyService.insertChange(
            `Se añade profesor con RUT ${teacher.rut}`,
            Collections.USER,
            user_id,
            'add',
        )
        return newTeacher
    }

    async createTeachers(directives: UserDTO[], user_id: string) {
        const newDirectives = this.usersService.createUsers(
            directives.map((directive) => {
                return {
                    ...directive,
                    user_type: Role.DIRECTIVE,
                }
            }),
        )
        this.historyService.insertChange(
            `Se añaden directivos con RUTs: ${directives
                .map((directive) => directive.rut)
                .join(', ')}`,
            Collections.USER,
            user_id,
            'add',
        )
        return newDirectives
    }

    async updateTeacher(
        directive: UpdateUserDTO,
        directive_id: string,
        user_id: string,
    ) {
        const updatedDirective = await this.usersService.updateUser(
            directive,
            directive_id,
        )
        this.historyService.insertChange(
            `Se actualiza directivo con RUT ${directive.rut}`,
            Collections.USER,
            user_id,
            'update',
        )
        return updatedDirective
    }

    async dismissTeacher(directive_id: string, why: string, user_id: string) {
        const directive = await this.usersService.getUserID(directive_id)
        if (!directive) throw new NotFoundException('No existe el directivo')
        const dismiss = await this.usersService.changeStatusUser(
            directive_id,
            directive.status === 0 ? 1 : 0,
        )
        this.historyService.insertChange(
            `Se da de baja al directivo con RUT ${directive.rut}`,
            Collections.USER,
            user_id,
            'dismiss',
            why,
        )
        return dismiss
    }
}
