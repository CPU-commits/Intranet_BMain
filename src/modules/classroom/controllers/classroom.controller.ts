import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { GradeConfigDTO } from '../dtos/grade_config.dto'
import { ClassroomService } from '../service/classroom.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/classroom')
export class ClassroomController {
    constructor(private readonly classroomService: ClassroomService) {}

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
