import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
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
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { PayloadToken } from 'src/auth/models/token.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import { ResApi } from 'src/models/res.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { AnchorDTO } from '../dtos/anchor.dto'
import { SpecialtyDTO } from '../dtos/specialty.dto'
import { SubjectDTO } from '../dtos/subject.dto'
import { SpecialtiesRes } from '../res/specialties.res'
import { SpecialtyRes } from '../res/specialty.res'
import { SubjectRes } from '../res/subject.res'
import { SubjectsRes } from '../res/subjects.res'
import { SubjectsService } from '../service/subjects.service'

@ApiTags('Main', 'Subject', 'roles.director', 'roles.directive')
@ApiServiceUnavailableResponse({
    description: 'MongoDB || Nats service unavailable',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/subjects')
export class SubjectsController {
    constructor(private subjectService: SubjectsService) {}

    // Subjects
    @ApiExtraModels(SubjectsRes)
    @ApiOperation({
        description: 'Get subjects',
        summary: 'Get subjects',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(SubjectsRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_subjects')
    async getSubjects(@Res() res: Response) {
        try {
            const subjects = await this.subjectService.getSubjects()
            handleRes(res, {
                subjects,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(SubjectRes)
    @ApiOperation({
        description: 'New subject',
        summary: 'New subject',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(SubjectRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/new_subject')
    async newSubject(
        @Res() res: Response,
        @Req() req: Request,
        @Body() subject: SubjectDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            const subjectData = await this.subjectService.newSubject(
                subject,
                user._id,
            )
            handleRes(res, {
                subject: subjectData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        description: 'Delete subject',
        summary: 'Delete subject',
    })
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Delete('/delete_subject/:idSubject')
    async deleteSubject(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idSubject', MongoIdPipe) idSubject: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.subjectService.deleteSubject(idSubject, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
    // Specialties
    @ApiExtraModels(SpecialtiesRes)
    @ApiOperation({
        description: 'Get specialties',
        summary: 'Get specialties',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(SpecialtiesRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_specialties')
    async getSpecialties(@Res() res: Response) {
        try {
            const specialties = await this.subjectService.getSpecialties()
            handleRes(res, {
                specialties,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(SpecialtyRes)
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(SpecialtyRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/new_specialty')
    async newSpecialty(
        @Res() res: Response,
        @Req() req: Request,
        @Body() specialty: SpecialtyDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            const specialtyData = await this.subjectService.newSpecialty(
                specialty.specialty,
                user._id,
            )
            handleRes(res, {
                specialty: specialtyData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        description: 'Delete specialty',
        summary: 'Delete specialty',
    })
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Delete('/delete_specialty/:idSpecialty')
    async deleteSpecialty(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idSpecialty', MongoIdPipe) idSpecialty: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.subjectService.deleteSpecialty(idSpecialty, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    // Anchor
    @ApiExtraModels(SubjectRes)
    @ApiOperation({
        description: 'Add subject',
        summary: 'Add subject',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(SubjectRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/add_subject')
    async addSubject(
        @Res() res: Response,
        @Req() req: Request,
        @Body() anchor: AnchorDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            const subjectAdded = await this.subjectService.addSubject(
                anchor,
                user._id,
            )
            handleRes(res, {
                subject: subjectAdded,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        description: 'Delete subject course',
        summary: 'Delete subject course',
    })
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Delete('/delete_subject_course/:idSubject/:idCourse')
    async deleteSubjectCourse(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idSubject', MongoIdPipe) idSubject: string,
        @Param('idCourse', MongoIdPipe) idCourse: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.subjectService.deleteSubjectCourse(
                idSubject,
                idCourse,
                user._id,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
