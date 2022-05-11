import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
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
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { SemesterDTO, SemesterUpdateDTO } from '../dtos/semester.dto'
import { SemestersService } from '../service/semesters.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/semesters')
export class SemestersController {
    constructor(private semestersService: SemestersService) {}

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_semesters')
    async getSemesters(@Res() res: Response) {
        try {
            const semesters = await this.semestersService.getSemesters()
            handleRes(res, {
                semesters,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/add_semester')
    async newSemester(
        @Res() res: Response,
        @Req() req: Request,
        @Body() semester: SemesterDTO,
    ) {
        try {
            const user: PayloadToken = req.user
            const newSemester = await this.semestersService.newSemester(
                semester,
                user._id,
            )
            handleRes(res, {
                semester: newSemester,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/init_semester/:id')
    async initSemester(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) semesterId: string,
    ) {
        try {
            const user: PayloadToken = req.user
            await this.semestersService.initSemester(semesterId, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Put('/update_semester/:id')
    async updateSemester(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) idSemester: string,
        @Body() semester: SemesterUpdateDTO,
    ) {
        try {
            const user: PayloadToken = req.user
            const semesterUpdated = await this.semestersService.updateSemester(
                semester,
                idSemester,
                user._id,
            )
            handleRes(res, {
                semester: semesterUpdated,
            })
        } catch (err) {
            handleError(err, res)
        }
    }
}
