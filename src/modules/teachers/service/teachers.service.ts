import {
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Role } from 'src/auth/models/roles.model'
import { CourseService } from 'src/modules/courses/service/course.service'
import { Collections } from 'src/modules/history/models/collections.model'
import { HistoryService } from 'src/modules/history/service/history.service'
import { UpdateUserDTO, UserDTO } from 'src/modules/users/dtos/user.dto'
import { User } from 'src/modules/users/entities/user.entity'
import { UsersService } from 'src/modules/users/services/users/users.service'
import { SubjectCourseDTO } from '../dtos/subject_course.dto'
import { Teacher } from '../entities/teacher.entity'

@Injectable()
export class TeachersService {
    constructor(
        @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
        private historyService: HistoryService,
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
        @Inject(forwardRef(() => CourseService))
        private coursesService: CourseService,
    ) {}

    private async getImpartTeacher(teacherId: string) {
        return await this.teacherModel
            .findOne({ user: teacherId }, { user: 0 })
            .populate('imparted.subject', { subject: 1 })
            .populate({
                path: 'imparted.course',
                select: 'course section',
                populate: {
                    path: 'course',
                    select: 'course',
                },
            })
            .exec()
    }

    async getTeacherByIDUser(idUser: string) {
        return await this.teacherModel
            .findOne({ user: idUser })
            .populate('user', { password: 0 })
            .populate('imparted.subject', { subject: 1 })
            .populate({
                path: 'imparted.course',
                select: 'course section',
                populate: {
                    path: 'course',
                    select: 'course',
                },
            })
            .exec()
    }

    async getTeacherByID(idTeacher: string) {
        return await this.teacherModel
            .findById(idTeacher)
            .populate('user', { password: 0 })
            .populate('imparted.subject', { subject: 1 })
            .populate({
                path: 'imparted.course',
                select: 'course section',
                populate: {
                    path: 'course',
                    select: 'course',
                },
            })
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
                        const imparted = await this.getImpartTeacher(
                            user._id.toString(),
                        )
                        return {
                            _id: imparted._id,
                            user,
                            imparted: imparted.imparted,
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
            imparted: [],
        })
        await newTeacher.save()
        this.historyService.insertChange(
            `Se añade profesor con RUT ${teacher.rut}`,
            Collections.USER,
            user_id,
            'add',
        )
        return await this.getTeacherByID(newTeacher._id.toString())
    }

    async createTeachers(teachers: UserDTO[], user_id: string) {
        const newTeachers = await this.usersService.createUsers(
            teachers.map((directive) => {
                return {
                    ...directive,
                    user_type: Role.TEACHER,
                }
            }),
        )
        const response = newTeachers.map((teacher) => {
            return {
                user: teacher._id.toString(),
            }
        })
        await this.teacherModel.insertMany(response)
        this.historyService.insertChange(
            `Se añaden profesores con RUTs: ${newTeachers
                .map((directive) => directive.rut)
                .join(', ')}`,
            Collections.USER,
            user_id,
            'add',
        )
        return newTeachers
    }

    async updateTeacher(
        directive: UpdateUserDTO,
        directive_id: string,
        idUser: string,
    ) {
        const updatedDirective = await this.usersService.updateUser(
            directive,
            directive_id,
        )
        this.historyService.insertChange(
            `Se actualiza profesor con RUT ${directive.rut}`,
            Collections.USER,
            idUser,
            'update',
        )
        return updatedDirective
    }

    async addSubjectCourse(
        subjectCourse: SubjectCourseDTO,
        idTeacher: string,
        idUser: string,
    ) {
        const teacher = await this.getTeacherByID(idTeacher)
        if (!teacher) throw new NotFoundException('No existe el profesor')
        const isUsed = teacher.imparted.filter((imparted) => {
            if (
                imparted.course.toString() === subjectCourse.course &&
                imparted.subject.toString() === subjectCourse.subject
            )
                return imparted
        })
        if (isUsed.length > 0)
            throw new ConflictException(
                'La materia y curso, ya están asignados al profesor',
            )
        const subjectCourseData = await this.coursesService.getSubjectSection(
            subjectCourse.subject,
            subjectCourse.course,
        )
        if (!subjectCourseData)
            throw new NotFoundException('La materia o curso no existe')
        // Add subject and course to Teacher
        await teacher
            .updateOne(
                {
                    $push: {
                        imparted: {
                            subject: subjectCourse.subject,
                            course: subjectCourse.course,
                        },
                    },
                },
                { new: true },
            )
            .exec()
        const teacherUser = teacher.user as User
        const teacherUpdated = await this.getTeacherByID(idTeacher)
        this.historyService.insertChange(
            `Se añade la materia y curso (${teacherUpdated.imparted}) al
            profesor con RUT ${teacherUser.rut}`,
            Collections.USER,
            idUser,
            'update',
        )
        return teacherUpdated
    }

    async dismissTeacher(directive_id: string, why: string, user_id: string) {
        const directive = await this.usersService.getUserID(directive_id)
        if (!directive) throw new NotFoundException('No existe el directivo')
        const dismiss = await this.usersService.changeStatusUser(
            directive_id,
            directive.status === 0 ? 1 : 0,
        )
        this.historyService.insertChange(
            `Se da de baja al profesor con RUT ${directive.rut}`,
            Collections.USER,
            user_id,
            'dismiss',
            why,
        )
        return dismiss
    }
}
