import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'

import { UpdateUserDTO, UserDTO } from '../../dtos/user.dto'

import { User } from '../../entities/user.entity'
import { Role } from 'src/auth/models/roles.model'
import { StudentsService } from 'src/modules/students/service/students.service'
import { TeachersService } from 'src/modules/teachers/service/teachers.service'

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @Inject(forwardRef(() => StudentsService))
        private studentsService: StudentsService,
        @Inject(forwardRef(() => TeachersService))
        private teachersService: TeachersService,
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
                ? await this.userModel.find().count().exec()
                : undefined,
        }
    }

    async getUserID(user_id: string) {
        return await this.userModel.findById(user_id).exec()
    }

    async getUserRUT(rut: string) {
        return await this.userModel.findOne({ rut }).exec()
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
