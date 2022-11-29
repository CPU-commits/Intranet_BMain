import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Res,
    UseGuards,
} from '@nestjs/common'
import {
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiServiceUnavailableResponse,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger'
import { Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import { ResApi } from 'src/models/res.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { GradeConfigDTO } from '../dtos/grade_config.dto'
import { GradeConfig } from '../res/grade_config.res'
import { ModulesRes } from '../res/modules.res'
import { ClassroomService } from '../service/classroom.service'

@ApiTags('Main', 'Classroom', 'roles.directive', 'roles.director')
@ApiServiceUnavailableResponse({
    description: 'MongoDB || Nats service unavailable',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/classroom')
export class ClassroomController {
    constructor(private readonly classroomService: ClassroomService) {}

    @ApiExtraModels(ModulesRes)
    @ApiOperation({
        description: 'Get modules',
        summary: 'Get modules',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(ModulesRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_modules')
    async getModules(@Res() res: Response) {
        try {
            const modules =
                await this.classroomService.getModulesCurrentSemester()
            handleRes(res, {
                modules,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        description: 'Get modules semester',
        summary: 'Get modules semester',
    })
    @ApiQuery({
        name: 'idSemester',
        required: false,
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(ModulesRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_modules_semester/:idSemester')
    async getModulesSemester(
        @Res() res: Response,
        @Param('idSemester', MongoIdPipe) idSemester: string,
    ) {
        try {
            const modules = await this.classroomService.getModulesSemester(
                idSemester,
            )
            handleRes(res, {
                modules,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        description: 'Get populated modules semester',
        summary: 'Get populated modules semester',
    })
    @ApiQuery({
        name: 'idSemester',
        required: false,
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(ModulesRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_populated_modules_semester/:idSemester')
    async getPopulatedModulesSemester(
        @Res() res: Response,
        @Param('idSemester', MongoIdPipe) idSemester: string,
    ) {
        try {
            const modules =
                await this.classroomService.getPopulatedModulesSemester(
                    idSemester,
                )
            handleRes(res, {
                modules,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(GradeConfig)
    @ApiOperation({
        description: 'Get grade config',
        summary: 'Get grade config',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(GradeConfig),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_grade_config')
    async getGradeConfig(@Res() res: Response) {
        try {
            const gradeConfig = await this.classroomService.getGradeConfig()
            handleRes(res, {
                gradeConfig,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        summary: 'Update grades config',
        description: 'Update grades config',
    })
    @ApiOkResponse({
        schema: {
            $ref: getSchemaPath(ResApi),
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/update_grades_config')
    async updateGradesConfig(
        @Res() res: Response,
        @Body() grade: GradeConfigDTO,
    ) {
        try {
            await this.classroomService.updateGradesConfig(grade)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
