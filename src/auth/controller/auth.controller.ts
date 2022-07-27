import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common'
import { Request, Response } from 'express'
import { AuthGuard } from '@nestjs/passport'

import { AuthService } from '../services/auth.service'
import handleError from 'src/res/handleError'

@Controller('api/authentication')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(AuthGuard('local'))
    @Post('/')
    login(@Req() req: Request, @Res() res: Response) {
        try {
            const user = req.user
            const token = this.authService.generateJWT(user)
            res.json(token)
        } catch (err) {
            handleError(err, res)
        }
    }
}
