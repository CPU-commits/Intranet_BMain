import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { AssistanceService } from '../../services/assistance/assistance.service'
import handleError from 'src/res/handleError'
import { Request, Response } from 'express'
import handleRes from 'src/res/handleRes'
import { PayloadToken } from 'src/auth/models/token.model'
import { AssistanceDTO } from '../../dtos/assistance.dto'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/assistance')
export class AssistanceController {
    constructor(private readonly assistanceService: AssistanceService) {}

    @Roles(Role.DIRECTIVE, Role.TEACHER, Role.DIRECTOR)
    @Get('/sections')
    async getSectionsAssistence(
        @Res() res: Response,
        @Req() req: Request,
        @Query('limit') limit?: number,
        @Query('skip') skip?: number,
        @Query('total') total?: boolean,
    ) {
        try {
            const user = req.user as PayloadToken
            const sections = await this.assistanceService.getSectionsAssistance(
                user,
                { limit, skip, total },
            )
            handleRes(res, sections)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/:idSection')
    async getSectionAssistance(
        @Res() res: Response,
        @Param('idSection', MongoIdPipe) idSection: string,
        @Query('limit') limit?: number,
        @Query('skip') skip?: number,
        @Query('total') total?: boolean,
    ) {
        try {
            const assistance =
                await this.assistanceService.getAssistancesSection(idSection, {
                    limit,
                    skip,
                    total,
                })

            handleRes(res, assistance)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.TEACHER, Role.DIRECTOR)
    @Get('/:idSection/current')
    async getSectionAssistanceCurrent(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idSection', MongoIdPipe) idSection: string,
    ) {
        try {
            const user = req.user as PayloadToken
            const assistance =
                await this.assistanceService.getCurrentAssistanceSection(
                    user,
                    idSection,
                )

            handleRes(res, { assistance })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.TEACHER, Role.DIRECTOR)
    @Post('/:idSection')
    async uploadAssistance(
        @Res() res: Response,
        @Req() req: Request,
        @Body() assistance: AssistanceDTO,
        @Param('idSection', MongoIdPipe) idSection: string,
    ) {
        try {
            const user = req.user as PayloadToken

            await this.assistanceService.uploadAssistance(
                assistance,
                idSection,
                user,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
