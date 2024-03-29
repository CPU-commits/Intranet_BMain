import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common'
import {
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiServiceUnavailableResponse,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger'
import { Request, Response } from 'express'
import { Public } from 'src/auth/decorators/public.decorator'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { PayloadToken } from 'src/auth/models/token.model'
import { ResApi } from 'src/models/res.model'
import handleError from 'src/res/handleError'
import { handleRedirect } from 'src/res/handleRedirect'
import handleRes from 'src/res/handleRes'
import { ContactDTO } from '../dtos/contact.dto'
import { EmailDTO } from '../dtos/email.dto'
import { PersonsRes } from '../res/persons.res'
import { UserRes } from '../res/user.res'
import { UsersService } from '../services/users/users.service'

@ApiTags('Main', 'User')
@ApiServiceUnavailableResponse({
    description: 'MongoDB || Nats service unavailable',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @ApiExtraModels(UserRes)
    @ApiOperation({
        description: 'Get data',
        summary: 'Get data',
    })
    @ApiTags('roles.all')
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(UserRes),
                        },
                    },
                },
            ],
        },
    })
    @Get('/get_data')
    async getData(@Res() res: Response, @Req() req: Request) {
        try {
            const user = req.user as PayloadToken
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

    @ApiExtraModels(PersonsRes)
    @ApiOperation({
        description: 'Get persons history',
        summary: 'Get persons history',
    })
    @ApiTags('roles.directive', 'roles.director')
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(PersonsRes),
                        },
                    },
                },
            ],
        },
    })
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

    @ApiOperation({
        description: 'Change email',
        summary: 'Change email',
    })
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @Post('/change_email')
    async changeEmail(
        @Res() res: Response,
        @Req() req: Request,
        @Body() email: EmailDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.usersService.changeEmail(email.email, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Public()
    @Post('/recover_password')
    async recoverPassword(@Res() res: Response, @Body() contact: ContactDTO) {
        try {
            await this.usersService.recoverPassword(contact.contact)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Public()
    @Get('/recover_password_token')
    async recoverPasswordToken(
        @Res() res: Response,
        @Query('token') token: string,
    ) {
        try {
            await this.usersService.recoverPasswordToken(token)
            // Params
            const params = new Map<string, string>()
            params.set('reset', 'true')

            handleRedirect(res, {
                to: '/',
                toClient: true,
                params,
            })
        } catch (err) {
            // Params
            const params = new Map<string, string>()
            params.set('reset', 'false')

            handleRedirect(res, {
                to: '/',
                toClient: true,
                params,
            })
        }
    }
}
