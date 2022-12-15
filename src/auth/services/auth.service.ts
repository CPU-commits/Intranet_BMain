import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { JwtService } from '@nestjs/jwt'

import { UsersService } from 'src/modules/users/services/users/users.service'
import { PayloadToken } from '../models/token.model'
import { User } from 'src/modules/users/entities/user.entity'
import { InjectModel } from '@nestjs/mongoose'
import { Auth } from '../entities/auth.model'
import { Model } from 'mongoose'
import config from 'src/config'
import { ConfigType } from '@nestjs/config'
import { ObjectId } from 'mongodb'

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Auth.name) private authModel: Model<Auth>,
        private usersService: UsersService,
        private jwtService: JwtService,
        @Inject(config.KEY) private configService: ConfigType<typeof config>,
    ) {}

    async validateUser(rut: string, password: string) {
        const user = await this.usersService.getUserRUT(rut)
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password)
            if (isMatch) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { password: _, ...rta } = user.toJSON()
                return rta
            }
        } else {
            return null
        }
    }

    async generateAccess(refreshToken: string) {
        const valueToken = jwt.decode(refreshToken) as {
            type: string
            _id: string
        }
        const idUser = new ObjectId(valueToken._id)
        if (valueToken.type !== 'refresh')
            throw new UnauthorizedException('El token no es de tipo acceso')
        const auth = await this.authModel
            .findOne({
                user: idUser,
            })
            .exec()
        if (!auth) throw new UnauthorizedException('No has iniciado sesión')
        if (
            auth.refresh_token !== refreshToken ||
            !jwt.verify(refreshToken, this.configService.jwtRefresh, {
                ignoreExpiration: false,
            })
        )
            throw new UnauthorizedException('Unauthorized')
        if (auth.uses === 3)
            throw new UnauthorizedException(
                'Has excedido la cantidad de sesiones, inicia sesión nuevamente',
            )
        const user = await this.usersService.getUserID(valueToken._id)
        // Sum 1
        await auth
            .updateOne(
                {
                    $set: {
                        uses: auth.uses + 1,
                    },
                },
                { new: true },
            )
            .exec()
        const payload: PayloadToken = {
            user_type: user.user_type,
            _id: user._id.toString(),
            sub: 'JWT Token Intranet',
            type: 'access',
            name: `${user.name} ${user.first_lastname}`,
        }
        return this.jwtService.sign(payload)
    }

    async generateRefresh(idUser: string) {
        const refresh = {
            sub: 'JWT Refresh',
            type: 'refresh',
            _id: idUser,
        }
        const token = jwt.sign(refresh, this.configService.jwtRefresh, {
            expiresIn: '7h',
        })
        const user = await this.authModel
            .findOne({
                user: idUser,
            })
            .exec()
        if (!user) {
            const newUser = new this.authModel({
                last_session: new Date(),
                refresh_token: token,
                user: idUser,
            })
            await newUser.save()
        } else {
            await user
                .updateOne(
                    {
                        $set: {
                            refresh_token: token,
                            last_session: new Date(),
                            uses: 0,
                        },
                    },
                    { new: true },
                )
                .exec()
        }

        return token
    }

    async generateJWT(user: User & { _id: string }) {
        const payload: PayloadToken = {
            user_type: user.user_type,
            _id: user._id,
            sub: 'JWT Token Intranet',
            type: 'access',
            name: `${user.name} ${user.first_lastname}`,
        }
        return {
            success: true,
            access_token: this.jwtService.sign(payload),
            refresh_token: await this.generateRefresh(user._id),
            user: {
                _id: user._id,
                name: `${user.name} ${user.first_lastname}`,
                status: user.status,
                user_type: user.user_type,
            },
        }
    }
}
