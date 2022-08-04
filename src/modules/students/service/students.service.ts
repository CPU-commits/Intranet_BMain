import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Role } from 'src/auth/models/roles.model'
import { Collections } from 'src/modules/history/models/collections.model'
import { HistoryService } from 'src/modules/history/service/history.service'
import { UpdateUserDTO } from 'src/modules/users/dtos/user.dto'
import { UsersService } from 'src/modules/users/services/users/users.service'
import { StudentDTO } from '../dtos/student.dto'
import { Student } from '../entities/student.entity'

@Injectable()
export class StudentsService {
    constructor(
        @InjectModel(Student.name) private studentModel: Model<Student>,
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
        private historyService: HistoryService,
    ) {}

    async getDataByIDUser(studentId: string) {
        return await this.studentModel
            .findOne({ user: studentId })
            .populate('user', { password: 0 })
            .populate({
                path: 'course',
                select: 'section course',
                populate: {
                    path: 'course',
                    select: 'course',
                },
            })
            .exec()
    }

    async getStudentByIDUser(studentId: string) {
        return await this.studentModel
            .findOne({ user: studentId })
            .populate({
                path: 'course',
                select: 'section course',
                populate: {
                    path: 'course',
                    select: 'course',
                },
            })
            .exec()
    }

    async getStudents(
        search?: string,
        skip?: number,
        limit?: number,
        total = false,
        actived = false,
    ) {
        const status = actived ? 1 : undefined
        return await this.usersService
            .getUsers(
                {
                    $or: [
                        { user_type: Role.STUDENT },
                        { user_type: Role.STUDENT_DIRECTIVE },
                    ],
                    status,
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
            .then(async (data) => {
                console.log(data)
                const students = await Promise.all(
                    data.users.map(async (user) => {
                        const student = await this.getStudentByIDUser(
                            user._id.toString(),
                        )
                        return {
                            _id: user._id,
                            registration_number: student.registration_number,
                            name: user.name,
                            first_lastname: user.first_lastname,
                            second_lastname: user.second_lastname,
                            rut: user.rut,
                            user_type: user.user_type,
                            status: user.status,
                            course: student.course,
                        }
                    }),
                )
                return {
                    total: data.total,
                    users: students,
                }
            })
    }

    async getStudentsFromIdCourse(idCourse: string) {
        return await this.studentModel
            .find({
                course: idCourse,
            })
            .populate('user', {
                name: 1,
                first_lastname: 1,
                second_lastname: 1,
                rut: 1,
            })
            .sort({ name: 1, first_lastname: 1, second_lastname: 1 })
            .exec()
    }

    async createStudent(student: StudentDTO, user_id: string) {
        const { registration_number, ...rest } = student
        const newUser = await this.usersService.createUser({
            ...rest,
            user_type: Role.STUDENT,
        })
        const newStudent = new this.studentModel({
            user: newUser._id.toString(),
            registration_number,
        })
        await newStudent.save()
        this.historyService.insertChange(
            `Se añade alumno con RUT ${student.rut}`,
            Collections.USER,
            user_id,
            'add',
        )
        return newUser
    }

    async createStudents(students: StudentDTO[], user_id: string) {
        const newStudents = await this.usersService.createUsers(
            students.map((student) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { registration_number: _, ...rest } = student
                return {
                    ...rest,
                    user_type: Role.STUDENT,
                }
            }),
        )
        const response = newStudents.map((student, i) => {
            return {
                user: student._id.toString(),
                registration_number: students[i].registration_number,
            }
        })
        await this.studentModel.insertMany(response)
        this.historyService.insertChange(
            `Se añaden alumnos con RUTs: ${students
                .map((student) => student.rut)
                .join(', ')}`,
            Collections.USER,
            user_id,
            'add',
        )
        return newStudents
    }

    async updateStudent(
        student: UpdateUserDTO,
        student_id: string,
        user_id: string,
    ) {
        const studentData = await this.getStudentByIDUser(student_id)
        if (!studentData) throw new NotFoundException('No existe el estudiante')
        const updatedStudent = await this.usersService.updateUser(
            student,
            student_id,
        )
        await this.studentModel
            .findByIdAndUpdate(
                studentData._id,
                {
                    $set: student,
                },
                { new: true },
            )
            .exec()
        this.historyService.insertChange(
            `Se actualiza alumno con RUT ${student.rut}`,
            Collections.USER,
            user_id,
            'update',
        )
        return updatedStudent
    }

    async dismissStudent(student_id: string, why: string, user_id: string) {
        const student = await this.usersService.getUserID(student_id)
        if (!student) throw new NotFoundException('No existe el alumno')
        const status = student.status === 0 ? 1 : 0
        const dismiss = await this.usersService.changeStatusUser(
            student_id,
            status,
        )
        if (!status) {
            this.historyService.insertChange(
                `Se va de la institución el alumno con RUT ${student.rut}`,
                Collections.USER,
                user_id,
                'dismiss',
                why,
            )
        } else {
            this.historyService.insertChange(
                `Se reintegra a la institución el alumno con RUT ${student.rut}`,
                Collections.USER,
                user_id,
                'reintegrate',
                why,
            )
        }
        return dismiss
    }
}
