import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt'

import { UpdateUserDTO, UserDTO } from '../../dtos/user.dto'

import { User } from '../../entities/user.entity'

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    private async generatePassword(password: string) {
        const hash = await bcrypt.hashSync(password, 10)
        return hash
    }

    async getUsers(
        filter?: any,
        select = null,
        sort?,
        search?: string,
        limit?: number,
        skip?: number,
        total?: boolean,
    ) {
        if (!filter) filter = {}
        if (search) {
            filter.$or = [
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
            ]
        }
        const users = this.userModel.find(filter, select)
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
