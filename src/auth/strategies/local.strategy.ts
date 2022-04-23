import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import { AuthService } from '../services/auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'rut',
            passwordField: 'password',
        })
    }

    async validate(rut: string, password: string) {
        const user = await this.authService.validateUser(rut, password)
        if (!user)
            throw new UnauthorizedException(
                'Credenciales inválidas. Trate nuevamente',
            )
        return user
    }
}
