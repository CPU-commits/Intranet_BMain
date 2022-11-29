import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthGuard } from '@nestjs/passport'

import { AuthService } from '../services/auth.service'
import handleError from 'src/res/handleError'
import { User } from 'src/modules/users/entities/user.entity'

@Controller('api/authentication')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(AuthGuard('local'))
    @Post('/')
    login(@Req() req: Request, @Res() res: Response) {
        try {
            const user = req.user as User & { _id: string }
            const token = this.authService.generateJWT(user)
            res.json(token)
        } catch (err) {
            handleError(err, res)
        }
    }
}
