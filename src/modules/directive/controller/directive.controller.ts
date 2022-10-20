import {
    Body,
    Controller,
    Get,
    Param,
    ParseBoolPipe,
    Post,
    Put,
    Query,
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
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import { UpdateUserDTO, UserDTO } from 'src/modules/users/dtos/user.dto'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { WhyDTO } from '../dtos/Directive.dto'
import { DirectiveService } from '../services/directive.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/directive')
export class DirectiveController {
    constructor(private directiveService: DirectiveService) {}

    @Roles(Role.DIRECTOR)
    @Get('/get_directives')
    async getDirectives(
        @Res() res: Response,
        @Query('skip') skip?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('total', ParseBoolPipe) getTotal?: boolean,
    ) {
        try {
            const directives = await this.directiveService.getDirectives(
                search,
                skip,
                limit,
                getTotal,
            )
            handleRes(res, directives)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTOR)
    @Post('/new_directive')
    async newDirective(
        @Res() res: Response,
        @Req() req: Request,
        @Body() directive: UserDTO,
    ) {
        try {
            const user: PayloadToken = req.user
            const directiveData = await this.directiveService.createDirective(
                directive,
                user._id,
            )
            handleRes(res, {
                directive: directiveData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTOR)
    @Post('/new_directives')
    async newDirectives(
        @Res() res: Response,
        @Req() req: Request,
        @Body() directives: UserDTO[],
    ) {
        try {
            const user: PayloadToken = req.user
            await this.directiveService.createDirectives(directives, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTOR)
    @Post('/change_status/:id')
    async changeStatus(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) idDirective: string,
        @Body() why: WhyDTO,
    ) {
        try {
            const user: PayloadToken = req.user
            await this.directiveService.dismissDirective(
                idDirective,
                why.why,
                user._id,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTOR)
    @Put('/edit_directive/:id')
    async editDirective(
        @Res() res: Response,
        @Req() req: Request,
        @Body() directive: UpdateUserDTO,
        @Param('id', MongoIdPipe) idDirective: string,
    ) {
        try {
            const user: PayloadToken = req.user
            await this.directiveService.updateDirective(
                directive,
                idDirective,
                user._id,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
