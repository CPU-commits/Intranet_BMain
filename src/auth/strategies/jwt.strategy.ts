import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, Inject } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'

import config from '../../config'
import { PayloadToken } from '../models/token.model'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(@Inject(config.KEY) configService: ConfigType<typeof config>) {
        super({
            jwtFromRequest: ExtractJwt.fromHeader('access-token'),
            ignoreExpiration: true,
            secretOrKey: configService.jwtSecret,
        })
    }

    async validate(payload: PayloadToken) {
        return payload
    }
}
