import {
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectId } from 'mongodb'
import { Model } from 'mongoose'
import { Role } from 'src/auth/models/roles.model'
import { CourseLetter } from 'src/modules/courses/entities/course_letter.entity'
import { CourseService } from 'src/modules/courses/service/course.service'
import { Collections } from 'src/modules/history/models/collections.model'
import { HistoryService } from 'src/modules/history/service/history.service'
import { Subject } from 'src/modules/subjects/entities/subject.entity'
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
            teachers.map((teacher) => {
                return {
                    ...teacher,
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
                .map((teacher) => teacher.rut)
                .join(', ')}`,
            Collections.USER,
            user_id,
            'add',
        )
        return newTeachers
    }

    async updateTeacher(
        teacher: UpdateUserDTO,
        teacher_id: string,
        idUser: string,
    ) {
        const updatedteacher = await this.usersService.updateUser(
            teacher,
            teacher_id,
        )
        this.historyService.insertChange(
            `Se actualiza profesor con RUT ${teacher.rut}`,
            Collections.USER,
            idUser,
            'update',
        )
        return updatedteacher
    }

    async addSubjectCourse(
        subjectCourse: SubjectCourseDTO,
        idTeacher: string,
        idUser: string,
    ) {
        const teacher = await this.getTeacherByID(idTeacher)
        if (!teacher) throw new NotFoundException('No existe el profesor')
        console.log(subjectCourse)
        const isUsed = teacher.imparted.some(
            (imparted) =>
                (
                    imparted.course as CourseLetter & { _id: string }
                )._id.toString() === subjectCourse.course &&
                (
                    imparted.subject as Subject & { _id: string }
                )._id.toString() === subjectCourse.subject,
        )
        console.log(isUsed)
        if (isUsed)
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
        const index = teacherUpdated.imparted.findIndex((i) => {
            const course = i.course as CourseLetter & { _id: ObjectId }
            const subject = i.subject as Subject & { _id: ObjectId }
            if (
                course._id.toString() === subjectCourse.course &&
                subject._id.toString() === subjectCourse.subject
            )
                return i
        })

        const section = teacherUpdated.imparted[index].course as CourseLetter
        const subject = teacherUpdated.imparted[index].subject as Subject
        this.historyService.insertChange(
            `Se añade la materia y curso (${section.course} ${section.section} - ${subject.subject}) al
            profesor con RUT ${teacherUser.rut}`,
            Collections.USER,
            idUser,
            'update',
        )
        return teacherUpdated
    }

    async deleteSubjectCourse(
        idTeacher: string,
        idImparted: string,
        idUser: string,
    ) {
        const teacher = await this.getTeacherByID(idTeacher)
        if (!teacher) throw new NotFoundException('No existe el profesor')
        const teacherUpdated = await this.teacherModel.findByIdAndUpdate(
            idTeacher,
            {
                $pull: {
                    imparted: {
                        _id: idImparted,
                    },
                },
            },
            {
                new: true,
            },
        )
        this.historyService.insertChange(
            `Se elimina una materia y curso al profesor con RUT ${
                (teacher.user as User).rut
            }`,
            Collections.USER,
            idUser,
            'update',
        )
        return teacherUpdated
    }

    async dismissTeacher(teacher_id: string, why: string, user_id: string) {
        const teacher = await this.usersService.getUserID(teacher_id)
        if (!teacher) throw new NotFoundException('No existe el directivo')
        const status = teacher.status === 0 ? 1 : 0
        const dismiss = await this.usersService.changeStatusUser(
            teacher_id,
            status,
        )
        if (!status) {
            this.historyService.insertChange(
                `Se da de baja al profesor con RUT ${teacher.rut}`,
                Collections.USER,
                user_id,
                'dismiss',
                why,
            )
        } else {
            this.historyService.insertChange(
                `Se reintegra el profesor con RUT ${teacher.rut}`,
                Collections.USER,
                user_id,
                'reintegrate',
                why,
            )
        }
        return dismiss
    }
}
