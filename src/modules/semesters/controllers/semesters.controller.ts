import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
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
import { ObjectId } from 'mongodb'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { PayloadToken } from 'src/auth/models/token.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import { ResApi } from 'src/models/res.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { FinishSemesterDTO } from '../dtos/finish_semester.dto,'
import { SemesterDTO, SemesterUpdateDTO } from '../dtos/semester.dto'
import { FinishSemesterRes } from '../res/finish_semester.res'
import { RepeatingStudentRes } from '../res/repeating_students.res'
import { SemesterRes } from '../res/semester.res'
import { SemestersRes } from '../res/semesters.res'
import { SemestersService } from '../service/semesters.service'

@ApiTags('Main', 'Semester')
@ApiServiceUnavailableResponse({
    description: 'MongoDB || Nats service unavailable',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/semesters')
export class SemestersController {
    constructor(private semestersService: SemestersService) {}

    @ApiExtraModels(SemestersRes)
    @ApiOperation({
        summary: 'Get semesters',
        description: 'Get semesters',
    })
    @ApiTags('roles.all')
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(SemestersRes),
                        },
                    },
                },
            ],
        },
    })
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

    @ApiExtraModels(SemesterRes)
    @ApiOperation({
        summary: 'Get current semester',
        description: 'Get current semester',
    })
    @ApiTags('roles.all')
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(SemesterRes),
                        },
                    },
                },
            ],
        },
    })
    @Get('/get_current_semester')
    async getCurrentSemester(@Res() res: Response) {
        try {
            const semester = await this.semestersService.getCurrentSemester()
            handleRes(res, {
                semester,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        summary: 'Get years',
        description: 'Get years registereds in semesters',
    })
    @ApiTags('roles.all')
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            type: 'array',
                            items: {
                                type: 'integer',
                            },
                        },
                    },
                },
            ],
        },
    })
    @Get('/get_years')
    async getYears(@Res() res: Response) {
        try {
            const years = await this.semestersService.getYears()
            handleRes(res, {
                years,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(FinishSemesterRes)
    @ApiOperation({
        summary: 'Get finish semester',
        description: 'Get finish semester',
    })
    @ApiTags('roles.directive', 'roles.director')
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(FinishSemesterRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_finish_semester')
    async getFinishSemester(@Res() res: Response) {
        try {
            const finishSemester =
                await this.semestersService.getFinishSemester()
            handleRes(res, {
                finish_semester: finishSemester,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(SemestersRes)
    @ApiOperation({
        summary: 'Get semester year',
        description: 'Get semester by year',
    })
    @ApiTags('roles.directive', 'roles.director')
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(SemestersRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_semester_year/:year')
    async getSemesterYear(
        @Res() res: Response,
        @Param('year', ParseIntPipe) year: number,
    ) {
        try {
            const semesters = await this.semestersService.getSemestersFromYear(
                year,
            )
            handleRes(res, {
                semesters,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(SemesterRes)
    @ApiOperation({
        description: 'Get user participated semesters',
        summary: 'Get participated semesters',
    })
    @ApiTags('roles.student', 'roles.student_directive')
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(SemestersRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.STUDENT, Role.STUDENT_DIRECTIVE)
    @Get('/get_participated_semesters')
    async getParticipatedSemesters(@Res() res: Response, @Req() req: Request) {
        try {
            const user = req.user as PayloadToken
            const semesters =
                await this.semestersService.getParticipatedSemesters(user._id)
            handleRes(res, {
                semesters,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(RepeatingStudentRes)
    @ApiOperation({
        description: 'Get repeating students',
        summary: 'Get repeating students',
    })
    @ApiTags('roles.directive', 'roles.director')
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(RepeatingStudentRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_repeating_students/:idSemester')
    async getRepeatingStudents(
        @Res() res: Response,
        @Param('idSemester', MongoIdPipe) idSemester: string,
    ) {
        try {
            const students = await this.semestersService.getRepeatingStudents(
                new ObjectId(idSemester),
            )
            handleRes(res, {
                students,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        description: 'Add semester',
        summary: 'Add semester',
    })
    @ApiTags('roles.directive', 'roles.director')
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(SemesterRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/add_semester')
    async newSemester(
        @Res() res: Response,
        @Req() req: Request,
        @Body() semester: SemesterDTO,
    ) {
        try {
            const user = req.user as PayloadToken
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

    @ApiOperation({
        description: 'Init semester',
        summary: 'Init semester',
    })
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @ApiTags('roles.directive', 'roles.director')
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/init_semester/:idSemester')
    async initSemester(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idSemester', MongoIdPipe) semesterId: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.semestersService.initSemester(semesterId, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        description: 'Update semester',
        summary: 'Update semester',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(SemesterRes),
                        },
                    },
                },
            ],
        },
    })
    @ApiTags('roles.directive', 'roles.director')
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Put('/update_semester/:idSemester')
    async updateSemester(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idSemester', MongoIdPipe) idSemester: string,
        @Body() semester: SemesterUpdateDTO,
    ) {
        try {
            const user = req.user as PayloadToken
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

    @ApiOperation({
        description: 'Finish semester',
        summary: 'Finish semester',
    })
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @ApiTags('roles.directive', 'roles.director')
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Put('/finish_semester')
    async finishSemester(
        @Res() res: Response,
        @Req() req: Request,
        @Body() finishSemesterData: FinishSemesterDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.semestersService.finishSemester(
                user._id,
                finishSemesterData.students_repeat,
                finishSemesterData.students_next_courses,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        description: 'Interrupt process finish semester if is actived',
        summary: 'Interrupt finish semester',
    })
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @ApiTags('roles.directive', 'roles.director')
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Put('/interrupt_finish_semester')
    async interrumptFinishSemester(@Res() res: Response, @Req() req: Request) {
        try {
            const user = req.user as PayloadToken
            await this.semestersService.interruptFinishSemester(user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
