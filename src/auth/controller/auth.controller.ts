import { Controller, Post, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { AuthGuard } from '@nestjs/passport'

import { AuthService } from '../services/auth.service'
import { User } from 'src/modules/users/entities/user.entity'

@Controller('api/authentication')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(AuthGuard('local'))
    @Post('/')
    login(@Req() req: Request) {
        const user = req.user as User
        return this.authService.generateJWT(user)
    }
}
