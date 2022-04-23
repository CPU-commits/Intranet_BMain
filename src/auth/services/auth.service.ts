import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'

import { UsersService } from 'src/modules/users/services/users/users.service'
import { PayloadToken } from '../models/token.model'

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
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

    generateJWT(user: any) {
        const payload: PayloadToken = {
            user_type: user.user_type,
            _id: user._id,
            sub: 'JWT Token Intranet',
        }
        return {
            success: true,
            access_token: this.jwtService.sign(payload),
            user: {
                name: `${user.name} ${user.first_lastname}`,
                status: user.status,
                user_type: user.user_type,
            },
        }
    }
}