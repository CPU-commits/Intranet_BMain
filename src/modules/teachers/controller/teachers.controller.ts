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
    ApiBody,
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
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
import { WhyDTO } from 'src/modules/directive/dtos/Directive.dto'
import { UpdateUserDTO, UserDTO } from 'src/modules/users/dtos/user.dto'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { SubjectCourseDTO } from '../dtos/subject_course.dto'
import { Teacher } from '../entities/teacher.entity'
import { TeacherRes } from '../res/teacher.res'
import { TeachersRes } from '../res/teachers.res'
import { TeachersService } from '../service/teachers.service'

@ApiTags('Main', 'Teacher', 'roles.director', 'roles.directive')
@ApiServiceUnavailableResponse({
    description: 'MongoDB || Nats service unavailable',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/teachers')
export class TeachersController {
    constructor(private teachersService: TeachersService) {}

    @ApiExtraModels(TeachersRes)
    @ApiOperation({
        description: 'Get teachers',
        summary: 'Get teachers',
    })
    @ApiQuery({
        name: 'skip',
        required: false,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
    })
    @ApiQuery({
        name: 'search',
        required: false,
    })
    @ApiQuery({
        name: 'total',
        required: false,
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(TeachersRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Get('/get_teachers')
    async getTeachers(
        @Res() res: Response,
        @Query('skip') skip?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('total') getTotal?: boolean,
    ) {
        try {
            const directives = await this.teachersService.getTeachers(
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

    @ApiExtraModels(TeacherRes)
    @ApiOperation({
        summary: 'New teacher',
        description: 'New teacher',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(TeacherRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Post('/new_teacher')
    async newTeacher(
        @Res() res: Response,
        @Req() req: Request,
        @Body() teacher: UserDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            const teacherData = await this.teachersService.createTeacher(
                teacher,
                user._id,
            )
            handleRes(res, {
                teacher: teacherData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        summary: 'New teacher',
        description: 'New teacher',
    })
    @ApiBody({
        type: [UserDTO],
    })
    @ApiOkResponse({
        schema: {
            $ref: getSchemaPath(ResApi),
        },
    })
    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Post('/new_teachers')
    async newTeachers(
        @Res() res: Response,
        @Req() req: Request,
        @Body() directives: UserDTO[],
    ) {
        try {
            const user = req.user as PayloadToken
            await this.teachersService.createTeachers(directives, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        summary: 'Change status teacher',
        description: 'Change status teacher. 0 -> 1 || 1 -> 0',
    })
    @ApiOkResponse({
        schema: {
            $ref: getSchemaPath(ResApi),
        },
    })
    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Post('/change_status/:idTeacher')
    async changeStatus(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idTeacher', MongoIdPipe) idDirective: string,
        @Body() why: WhyDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.teachersService.dismissTeacher(
                idDirective,
                why.why,
                user._id,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        summary: 'Edit teacher',
        description: 'Edit teacher',
    })
    @ApiOkResponse({
        schema: {
            $ref: getSchemaPath(ResApi),
        },
    })
    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Put('/edit_teacher/:idTeacher')
    async editTeacher(
        @Res() res: Response,
        @Req() req: Request,
        @Body() directive: UpdateUserDTO,
        @Param('idTeacher', MongoIdPipe) idTeacher: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.teachersService.updateTeacher(
                directive,
                idTeacher,
                user._id,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        summary: 'Add subject course',
        description: 'Add subject course to teacher',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(Teacher),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Post('/add_subject_course/:idTeacher')
    async addSubjectCourse(
        @Res() res: Response,
        @Req() req: Request,
        @Body() subjectCourse: SubjectCourseDTO,
        @Param('idTeacher', MongoIdPipe) idTeacher: string,
    ) {
        try {
            const user = req.user as PayloadToken
            const teacherData = await this.teachersService.addSubjectCourse(
                subjectCourse,
                idTeacher,
                user._id,
            )
            handleRes(res, teacherData)
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        description: 'Delete subject course',
        summary: 'Delete subject course',
    })
    @ApiOkResponse({
        schema: {
            $ref: getSchemaPath(ResApi),
        },
    })
    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Delete('/delete_subject_course/:idTeacher/:idImparted')
    async deleteSubjectCourse(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idTeacher', MongoIdPipe) idTeacher: string,
        @Param('idImparted', MongoIdPipe) idImparted: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.teachersService.deleteSubjectCourse(
                idTeacher,
                idImparted,
                user._id,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
