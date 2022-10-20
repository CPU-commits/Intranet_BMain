import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { PayloadToken } from 'src/auth/models/token.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { EmailDTO } from '../dtos/email.dto'
import { UsersService } from '../services/users/users.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Get('/get_data')
    async getData(@Res() res: Response, @Req() req: Request) {
        try {
            const user: PayloadToken = req.user
            const userData = await this.usersService.getData(
                user._id,
                user.user_type,
            )
            handleRes(res, {
                user: userData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_persons_history')
    async getPersonsHistory(@Res() res: Response) {
        try {
            const persons = await this.usersService.getPersonsHistory()
            handleRes(res, {
                persons,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Post('/change_email')
    async changeEmail(
        @Res() res: Response,
        @Req() req: Request,
        @Body() email: EmailDTO,
    ) {
        try {
            const user: PayloadToken = req.user
            await this.usersService.changeEmail(email.email, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
