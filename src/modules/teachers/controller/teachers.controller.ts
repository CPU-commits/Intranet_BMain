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
import { WhyDTO } from 'src/modules/directive/dtos/Directive.dto'
import { UpdateUserDTO, UserDTO } from 'src/modules/users/dtos/user.dto'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { SubjectCourseDTO } from '../dtos/subject_course.dto'
import { TeachersService } from '../service/teachers.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/teachers')
export class TeachersController {
    constructor(private teachersService: TeachersService) {}

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

    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Post('/new_teacher')
    async newTeacher(
        @Res() res: Response,
        @Req() req: Request,
        @Body() teacher: UserDTO,
    ) {
        try {
            const user: PayloadToken = req.user
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

    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Post('/new_teachers')
    async newTeachers(
        @Res() res: Response,
        @Req() req: Request,
        @Body() directives: UserDTO[],
    ) {
        try {
            const user: PayloadToken = req.user
            await this.teachersService.createTeachers(directives, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Post('/change_status/:id')
    async changeStatus(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) idDirective: string,
        @Body() why: WhyDTO,
    ) {
        try {
            const user: PayloadToken = req.user
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

    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Put('/edit_teacher/:id')
    async editTeacher(
        @Res() res: Response,
        @Req() req: Request,
        @Body() directive: UpdateUserDTO,
        @Param('id', MongoIdPipe) idDirective: string,
    ) {
        try {
            const user: PayloadToken = req.user
            await this.teachersService.updateTeacher(
                directive,
                idDirective,
                user._id,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Post('/add_subject_course/:id')
    async addSubjectCourse(
        @Res() res: Response,
        @Req() req: Request,
        @Body() subjectCourse: SubjectCourseDTO,
        @Param('id', MongoIdPipe) idTeacher: string,
    ) {
        try {
            const user: PayloadToken = req.user
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

    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Delete('/delete_subject_course/:idTeacher/:idImparted')
    async deleteSubjectCourse(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idTeacher', MongoIdPipe) idTeacher: string,
        @Param('idImparted', MongoIdPipe) idImparted: string,
    ) {
        try {
            const user: PayloadToken = req.user
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
