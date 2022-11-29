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
import {
    ApiBadRequestResponse,
    ApiExtraModels,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiServiceUnavailableResponse,
    ApiTags,
    ApiUnauthorizedResponse,
    getSchemaPath,
} from '@nestjs/swagger'
import { Request, Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { PayloadToken } from 'src/auth/models/token.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import { ResApi } from 'src/models/res.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { ObservationDTO, UpdateObservationDTO } from '../dtos/observation.dto'
import { BookLifeRes } from '../res/booklife.res'
import { ObservationRes } from '../res/observation.res'
import { BookLifeService } from '../service/book_life.service'

@ApiTags('Main', 'BookLife')
@ApiServiceUnavailableResponse({
    description: 'MongoDB || Nats service unavailable',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/booklife')
export class BookLifeController {
    constructor(private readonly booklifeService: BookLifeService) {}

    @ApiExtraModels(BookLifeRes)
    @ApiOperation({
        description: 'Get student booklife',
        summary: 'Get booklife',
    })
    @ApiTags('roles.student', 'roles.student_directive')
    @ApiQuery({
        name: 'semester',
        required: false,
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                {
                    $ref: getSchemaPath(ResApi),
                },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(BookLifeRes),
                        },
                    },
                },
            ],
        },
    })
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

    @ApiOperation({
        description: 'Get booklife student',
        summary: 'Get booklife student',
    })
    @ApiTags('roles.directive', 'roles.teacher', 'roles.director')
    @Roles(Role.DIRECTIVE, Role.TEACHER, Role.DIRECTOR)
    @ApiQuery({
        name: 'semester',
        required: false,
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                {
                    $ref: getSchemaPath(ResApi),
                },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(BookLifeRes),
                        },
                    },
                },
            ],
        },
    })
    @Get('/get_booklife_student/:idStudent')
    async getBooklifeStudent(
        @Res() res: Response,
        @Query('semester') semester: string,
        @Param('idStudent', MongoIdPipe) idStudent: string,
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

    @ApiOperation({
        description: 'Upload observation',
        summary: 'Upload observation',
    })
    @ApiTags('roles.directive', 'roles.teacher', 'roles.director')
    @ApiNotFoundResponse({
        description: 'No existe el alumno',
    })
    @ApiBadRequestResponse({
        schema: {
            oneOf: [
                {
                    allOf: [
                        { $ref: getSchemaPath(ResApi) },
                        {
                            properties: {
                                message: {
                                    example: 'El usuario no es un alumno',
                                },
                            },
                        },
                    ],
                },
                {
                    allOf: [
                        { $ref: getSchemaPath(ResApi) },
                        {
                            properties: {
                                message: {
                                    example: 'El alumno no está activo',
                                },
                            },
                        },
                    ],
                },
                {
                    allOf: [
                        { $ref: getSchemaPath(ResApi) },
                        {
                            properties: {
                                message: {
                                    example: 'No existe el semestre',
                                },
                            },
                        },
                    ],
                },
                {
                    allOf: [
                        { $ref: getSchemaPath(ResApi) },
                        {
                            properties: {
                                message: {
                                    example:
                                        'No se puede registrar una observación para un semestre más adelante que el vigente',
                                },
                            },
                        },
                    ],
                },
            ],
        },
    })
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ObservationRes) },
    })
    @Roles(Role.DIRECTIVE, Role.TEACHER, Role.DIRECTOR)
    @Post('/upload_observation/:idStudent/:idSemester')
    async uploadObservation(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idStudent', MongoIdPipe) idStudent: string,
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

    @ApiOperation({
        description: 'Update observation',
        summary: 'Update observation',
    })
    @ApiTags('roles.directive', 'roles.teacher', 'roles.director')
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @ApiNotFoundResponse({
        description: 'No existe la observación',
    })
    @ApiUnauthorizedResponse({
        description: 'No puedes editar una observación no creada por ti',
    })
    @Roles(Role.DIRECTIVE, Role.TEACHER, Role.DIRECTOR)
    @Put('/update_observation/:idObservation')
    async updateObservation(
        @Res() res: Response,
        @Req() req: Request,
        @Body() observation: UpdateObservationDTO,
        @Param('idObservation', MongoIdPipe) idObservation: string,
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

    @ApiOperation({
        description: 'Delete observation',
        summary: 'Delete observation',
    })
    @ApiTags('roles.directive', 'roles.teacher', 'roles.director')
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @ApiNotFoundResponse({
        description: 'No existe la observación',
    })
    @ApiUnauthorizedResponse({
        description: 'No puedes eliminar una observación no hecha por ti',
    })
    @Roles(Role.DIRECTIVE, Role.TEACHER, Role.DIRECTOR)
    @Delete('/delete_observation/:idObservation')
    async deleteObservation(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idObservation', MongoIdPipe) idObservation: string,
    ) {
        try {
            await this.booklifeService.deleteObservation(
                idObservation,
                req.user as PayloadToken,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
