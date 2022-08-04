import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
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
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { ObservationDTO, UpdateObservationDTO } from '../dtos/observation.dto'
import { BookLifeService } from '../service/book_life.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/booklife')
export class BookLifeController {
    constructor(private readonly booklifeService: BookLifeService) {}

    @Roles(Role.STUDENT, Role.STUDENT_DIRECTIVE)
    @Get('/get_booklife')
    async getBooklife(
        @Res() res: Response,
        @Req() req: Request,
        @Query('semester') semester: string,
    ) {
        try {
            const user = req.user as PayloadToken
            const observations = await this.booklifeService.getBooklife(
                semester,
                user._id,
            )
            handleRes(res, {
                observations,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.TEACHER, Role.DIRECTOR)
    @Get('/get_booklife_student/:id')
    async getBooklifeStudent(
        @Res() res: Response,
        @Query('semester') semester: string,
        @Param('id', MongoIdPipe) idStudent: string,
    ) {
        try {
            const observations = await this.booklifeService.getBooklife(
                semester,
                idStudent,
            )
            handleRes(res, {
                observations,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.TEACHER, Role.DIRECTOR)
    @Post('/upload_observation/:id/:idSemester')
    async uploadObservation(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) idStudent: string,
        @Param('idSemester', MongoIdPipe) idSemester: string,
        @Body() observation: ObservationDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            const observationData =
                await this.booklifeService.uploadObservation(
                    observation,
                    idStudent,
                    idSemester,
                    user._id,
                )
            handleRes(res, {
                observation: observationData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.TEACHER, Role.DIRECTOR)
    @Put('/update_observation/:id')
    async updateObservation(
        @Res() res: Response,
        @Req() req: Request,
        @Body() observation: UpdateObservationDTO,
        @Param('id', MongoIdPipe) idObservation: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.booklifeService.updateObservation(
                observation,
                idObservation,
                user._id,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.TEACHER, Role.DIRECTOR)
    @Delete('/delete_observation/:id')
    async deleteObservation(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) idObservation: string,
    ) {
        try {
            await this.booklifeService.deleteObservation(
                idObservation,
                req.user,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
