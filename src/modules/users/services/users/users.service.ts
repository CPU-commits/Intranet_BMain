import {
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'

import { UpdateUserDTO, UserDTO } from '../../dtos/user.dto'
import { randomUUID } from 'crypto'

import { User } from '../../entities/user.entity'
import { Role } from 'src/auth/models/roles.model'
import { StudentsService } from 'src/modules/students/service/students.service'
import { TeachersService } from 'src/modules/teachers/service/teachers.service'
import { HistoryService } from 'src/modules/history/service/history.service'
import { ObjectId } from 'mongodb'
import { UsersToken } from '../../entities/users_token.entity'
import { Permissions } from '../../models/permissions.model'
import * as moment from 'moment'
import { ClientProxy } from '@nestjs/microservices'
import { Email } from 'src/models/email/imail.model'
import { RecoverPasswordTemplate } from 'src/models/email/templates/recover_password.model'

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(UsersToken.name)
        private readonly usersTokensModel: Model<UsersToken>,
        @Inject(forwardRef(() => StudentsService))
        private studentsService: StudentsService,
        @Inject(forwardRef(() => TeachersService))
        private teachersService: TeachersService,
        private readonly historyService: HistoryService,
        @Inject('NATS_CLIENT') private readonly natsClient: ClientProxy,
    ) {}

    private async generatePassword(password: string) {
        const hash = await bcrypt.hashSync(password, 10)
        return hash
    }

    async getData(idUser: string, role: string) {
        if (role === Role.STUDENT || role === Role.STUDENT_DIRECTIVE) {
            const student = await this.studentsService.getDataByIDUser(idUser)
            const {
                email,
                name,
                first_lastname,
                second_lastname,
                rut,
                status,
            } = student.user as User
            return {
                email,
                name,
                first_lastname,
                second_lastname,
                rut,
                status,
                registration_number: student.registration_number,
                course: student.course,
            }
        }
        if (role === Role.TEACHER) {
            const teacher = await this.teachersService.getTeacherByIDUser(
                idUser,
            )
            const {
                email,
                name,
                first_lastname,
                second_lastname,
                rut,
                status,
            } = teacher.user as User
            return {
                email,
                name,
                first_lastname,
                second_lastname,

                rut,
                status,
                imparted: teacher.imparted,
            }
        }
        return await this.userModel
            .findById(idUser, {
                password: 0,
            })
            .exec()
    }

    async getUsers(
        filter?: any,
        select = null,
        sort?: any,
        search?: string,
        limit?: number,
        skip?: number,
        total?: boolean,
    ) {
        if (!filter) filter = {}
        if (search) {
            let filterOr: Array<any>
            if (filter?.$or?.length > 0) filterOr = [...filter.$or]
            const searchAnd = [
                { $or: filter?.$or ? filterOr : [{}] },
                {
                    $or: [
                        {
                            name: {
                                $regex: new RegExp(search, 'i'),
                            },
                        },
                        {
                            first_lastname: {
                                $regex: new RegExp(search, 'i'),
                            },
                        },
                        {
                            second_lastname: {
                                $regex: new RegExp(search, 'i'),
                            },
                        },
                        {
                            rut: {
                                $regex: new RegExp(search, 'i'),
                            },
                        },
                    ],
                },
            ]
            if (filter.$and) {
                filter.$and = [...filter.$and, ...searchAnd]
            } else {
                filter.$and = searchAnd
            }
        }
        const users = this.userModel.find(filter, {
            password: 0,
            ...select,
        })
        if (limit) users.limit(limit)
        if (skip) users.skip(skip)
        if (sort) users.sort(sort)
        return {
            users: await users.exec(),
            total: total
                ? await this.userModel.count(filter).exec()
                : undefined,
        }
    }

    async getUsersFromIds(IDs: Array<string>) {
        return await this.userModel
            .find(
                {
                    _id: {
                        $in: IDs.map((ID) => {
                            return new ObjectId(ID)
                        }),
                    },
                },
                { password: 0 },
            )
            .exec()
    }

    async getUserID(user_id: string) {
        return await this.userModel.findById(user_id).exec()
    }

    async getUserRUT(rut: string) {
        return await this.userModel.findOne({ rut }).exec()
    }

    async getUserEmail(email: string) {
        return await this.userModel.findOne({ email }).exec()
    }

    async getPersonsHistory() {
        const persons = await this.historyService.getPersons()
        return await this.getUsersFromIds(persons)
    }

    async createUser(user: UserDTO) {
        const password = user.rut.slice(3, user.rut.length - 2)
        const newUser = new this.userModel({
            password: await this.generatePassword(password),
            ...user,
        })
        return await newUser.save()
    }

    async createUsers(users: UserDTO[]) {
        const response = await Promise.all(
            users.map(async (user) => {
                const password = user.rut.slice(3, user.rut.length - 2)
                return {
                    password: await this.generatePassword(password),
                    ...user,
                }
            }),
        ).then((data) => {
            return data
        })
        return await this.userModel.insertMany(response)
    }

    async updateUser(user: UpdateUserDTO, user_id: string) {
        return await this.userModel
            .findByIdAndUpdate(
                user_id,
                {
                    $set: user,
                },
                { new: true },
            )
            .exec()
    }

    async changeEmail(email: string, userId: string) {
        return await this.userModel
            .findByIdAndUpdate(
                userId,
                {
                    $set: {
                        email,
                    },
                },
                { new: true },
            )
            .exec()
    }

    async recoverPassword(contact: string) {
        let idUser: string | null = null
        let email: string | null = null
        // Try to get by rut
        const userRut = await this.getUserRUT(contact)
        if (!userRut) {
            // Try to get by email
            const userEmail = await this.getUserEmail(contact)
            if (userEmail) {
                email = contact
                idUser = userEmail._id.toString()
            }
        } else if (userRut?.email) {
            email = userRut.email
            idUser = userRut._id.toString()
        }
        if (!email)
            throw new ConflictException(
                'No hay email asociado al contacto indicado',
            )
        // Try to get token and delete
        await this.usersTokensModel
            .findOneAndDelete(
                {
                    user: idUser,
                    permissions: { $in: [Permissions.RECOVER_PASSWORD] },
                },
                { _id: 1 },
            )
            .exec()
        // Generate new token
        const token = randomUUID()

        const newToken = new this.usersTokensModel({
            user: idUser,
            token,
            permissions: [Permissions.RECOVER_PASSWORD],
            expired_at: moment().add(5, 'hours').toDate(),
        })
        await newToken.save()
        // Send email
        this.natsClient.emit('imail/send', {
            to: email,
            isIdUser: false,
            subject: 'Recuperar contraseña - Intranet',
            template: 'recover_password',
            templateProps: {
                '{{ TOKEN }}': token,
            },
        } as Email<RecoverPasswordTemplate>)
    }

    async recoverPasswordToken(token: string) {
        // Get token with permission
        const userToken = await this.usersTokensModel
            .findOne({
                token,
                permissions: { $in: [Permissions.RECOVER_PASSWORD] },
            })
            .exec()
        console.log(userToken)
        if (!userToken)
            throw new NotFoundException('No existe este token o está vencido')
        // Check if expired
        if (moment(userToken.expired_at).isBefore(new Date()))
            throw new NotFoundException('No existe este token o está vencido')
        const user = await this.getUserID(userToken.user.toString())
        const password = user.rut.slice(3, user.rut.length - 2)
        return await this.userModel
            .findByIdAndUpdate(
                userToken.user,
                { $set: { password: await this.generatePassword(password) } },
                { new: true },
            )
            .exec()
    }

    async changeStatusUser(user_id: string, status: number) {
        return await this.userModel
            .findByIdAndUpdate(
                user_id,
                {
                    $set: {
                        status,
                    },
                },
                { new: true },
            )
            .exec()
    }
}
