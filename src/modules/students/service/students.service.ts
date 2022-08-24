import {
    BadRequestException,
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Role } from 'src/auth/models/roles.model'
import { KeyValue } from 'src/modules/college/entities/key_value.entity'
import { Collections } from 'src/modules/history/models/collections.model'
import { HistoryService } from 'src/modules/history/service/history.service'
import { UpdateUserDTO } from 'src/modules/users/dtos/user.dto'
import { UsersService } from 'src/modules/users/services/users/users.service'
import { StudentDTO } from '../dtos/student.dto'
import { UpdateVotingDTO, VotingDTO } from '../dtos/voting.dto'
import { Student } from '../entities/student.entity'
import { Voting, VotingEnumValues, VotingKey } from '../models/voting.model'
import { Voting as VotingClass } from '../entities/voting.entity'
import { SemestersService } from 'src/modules/semesters/service/semesters.service'
import { ObjectId } from 'mongodb'
import { ClientProxy } from '@nestjs/microservices'
import moment from 'moment'
import { Vote } from '../entities/vote.entity'
import { NotifyGlobal, NotifyGlobalChannel } from 'src/models/notify.model'

@Injectable()
export class StudentsService {
    constructor(
        @Inject('NATS_CLIENT') private readonly natsClient: ClientProxy,
        @InjectModel(Student.name) private studentModel: Model<Student>,
        @InjectModel(KeyValue.name) private keyValueModel: Model<KeyValue>,
        @InjectModel(VotingClass.name)
        private readonly votingModel: Model<VotingClass>,
        @InjectModel(Vote.name) private readonly voteModel: Model<Vote>,
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
        private historyService: HistoryService,
        private readonly semestersService: SemestersService,
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
        const status = actived ? 1 : { $exists: true }
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

    async getVotingStatus() {
        const statusVoting = (await this.keyValueModel
            .findOne({
                key: VotingKey,
            })
            .exec()) as Voting
        if (!statusVoting) return VotingEnumValues.CLOSED
        return statusVoting.value
    }

    async getVoting() {
        const semester = await this.semestersService.getCurrentSemester()
        const voting = await this.votingModel
            .findOne({
                semester: semester._id.toString(),
            })
            .populate('lists.students._id', {
                name: 1,
                first_lastname: 1,
                second_lastname: 1,
            })
            .exec()
        return voting
    }

    async getVote(idUser: string) {
        const semester = await this.semestersService.getCurrentSemester()
        return await this.voteModel
            .findOne({
                semester: semester._id.toString(),
                user: idUser,
            })
            .exec()
    }

    async getMyVote(idUser: string) {
        return await this.voteModel.findOne({ user: idUser }).exec()
    }

    async listExists(idList: string) {
        const semester = await this.semestersService.getCurrentSemester()
        const voting = await this.votingModel
            .findOne(
                {
                    semester: semester._id.toString(),
                    lists: {
                        $elemMatch: {
                            _id: new ObjectId(idList),
                        },
                    },
                },
                { _id: 1 },
            )
            .exec()
        return voting != null
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

    async uploadVoting(voting: VotingDTO, idUser: string) {
        if (moment(new Date()).isAfter(moment(voting.start_date)))
            throw new BadRequestException(
                'La fecha de comienzo debe ser mayor a la actual',
            )
        if (moment(voting.start_date).isAfter(voting.finish_date))
            throw new BadRequestException(
                'La fecha de comienzo debe ser menor a la de termino',
            )
        const statusVoting = (await this.keyValueModel
            .findOne({
                key: VotingKey,
            })
            .exec()) as Voting
        if (!statusVoting || statusVoting?.value === 'opened') {
            const semester = await this.semestersService.getCurrentSemester()
            const newVoting = new this.votingModel({
                ...voting,
                semester: semester._id.toString(),
                lists: voting.lists.map((list) => {
                    return {
                        ...list,
                        _id: new ObjectId(),
                    }
                }),
            })
            const votingData = await newVoting.save()
            // Save status
            if (!statusVoting) {
                const status = new this.keyValueModel({
                    key: VotingKey,
                    value: VotingEnumValues.UPLOADED,
                })
                await status.save()
            } else {
                await this.keyValueModel
                    .updateOne(
                        { key: VotingKey },
                        { $set: { value: VotingEnumValues.UPLOADED } },
                        { new: true },
                    )
                    .exec()
            }
            // Emit
            this.natsClient.emit('open_close_voting', {
                start_date: voting.start_date,
                finish_date: voting.finish_date,
                period: voting.period,
            })
            this.historyService.insertChange(
                `Se inician las votaciones del semestre ${semester.semester}° - ${semester.year}`,
                VotingClass.name,
                idUser,
                'add',
            )
            return votingData
        }
        throw new ConflictException(
            'Actualmente no se puede subir el estado de votación',
        )
    }

    async vote(idUser: string, idList: string) {
        const status = await this.getVotingStatus()
        if (status !== 'in progress')
            throw new BadRequestException('No se puede votar')
        const listExists = await this.listExists(idList)
        if (!listExists)
            throw new BadRequestException(
                'No se puede votar por una lista que no existe',
            )
        const vote = await this.getVote(idUser)
        if (vote) throw new ConflictException('Ya se realizó un voto')
        const newVote = new this.voteModel({
            user: idUser,
            list: idList,
            date: new Date(),
        })
        return await newVote.save()
    }

    async updateVoting(voting: UpdateVotingDTO, idUser: string) {
        const semester = await this.semestersService.getCurrentSemester()
        const status = await this.getVotingStatus()
        if (status === 'closed')
            throw new BadRequestException('Las votaciones están cerradas')
        const currentVoting = await this.getVoting()
        if (!currentVoting)
            throw new BadRequestException('No existe ningúna votación en curso')
        const updatedVoting = await this.votingModel
            .updateOne(
                {
                    semester: semester._id.toString(),
                },
                {
                    $set: {
                        ...voting,
                        lists: voting?.lists?.map((list) => {
                            if (
                                currentVoting.lists.some(
                                    (l) => l._id.toString() === list?._id,
                                )
                            )
                                return list
                            return {
                                ...list,
                                _id: new ObjectId(),
                            }
                        }),
                    },
                },
                {
                    new: true,
                },
            )
            .exec()
        if (status === 'in progress') {
            const deletedLists: Array<{ list: string }> = []
            currentVoting.lists.forEach((list) => {
                if (!voting.lists.some((l) => l?._id === list._id.toString()))
                    deletedLists.push({
                        list: list._id.toString(),
                    })
            })
            if (deletedLists.length > 0) {
                await this.voteModel
                    .deleteMany({
                        $or: deletedLists,
                    })
                    .exec()
                this.natsClient.emit(NotifyGlobalChannel, {
                    Type: 'student',
                    Title: 'Se han actualizado las listas de votaciones, verifique si su voto está activo',
                    Link: '/votar',
                } as NotifyGlobal)
            }
        }
        // Emit
        this.natsClient.emit('open_close_voting', {
            start_date: voting?.start_date
                ? voting.start_date
                : currentVoting.start_date,
            finish_date: voting?.finish_date
                ? voting.finish_date
                : currentVoting.finish_date,
            period: voting?.period ? voting.period : currentVoting.period,
        })
        this.historyService.insertChange(
            `Se actualizan los datos de votación del semestre ${semester.semester}° - ${semester.year}`,
            Collections.VOTING,
            idUser,
            'update',
        )
        return updatedVoting
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
