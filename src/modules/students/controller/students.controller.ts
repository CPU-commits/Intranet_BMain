import {
    Body,
    Controller,
    Get,
    Param,
    ParseBoolPipe,
    ParseIntPipe,
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
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { StudentDTO, UpdateStudentDTO } from '../dtos/student.dto'
import { StudentsService } from '../service/students.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/students')
export class StudentsController {
    constructor(private studentsService: StudentsService) {}

    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Get('/get_students')
    async getStudents(
        @Res() res: Response,
        @Query('skip', ParseIntPipe) skip?: number,
        @Query('limit', ParseIntPipe) limit?: number,
        @Query('search') search?: string,
        @Query('total', ParseBoolPipe) getTotal?: boolean,
    ) {
        try {
            const students = await this.studentsService.getStudents(
                search,
                skip,
                limit,
                getTotal,
            )
            handleRes(res, students)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Post('/new_student')
    async newStudent(
        @Res() res: Response,
        @Req() req: Request,
        @Body() student: StudentDTO,
    ) {
        try {
            const user: PayloadToken = req.user
            const studentData = await this.studentsService.createStudent(
                student,
                user._id,
            )
            handleRes(res, {
                student: studentData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Post('/new_students')
    async newStudents(
        @Res() res: Response,
        @Req() req: Request,
        @Body() students: StudentDTO[],
    ) {
        try {
            const user: PayloadToken = req.user
            await this.studentsService.createStudents(students, user._id)
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
        @Param('id', MongoIdPipe) idStudent: string,
        @Body() why: WhyDTO,
    ) {
        try {
            const user: PayloadToken = req.user
            await this.studentsService.dismissStudent(
                idStudent,
                why.why,
                user._id,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Put('/edit_student/:id')
    async editStudent(
        @Res() res: Response,
        @Req() req: Request,
        @Body() student: UpdateStudentDTO,
        @Param('id', MongoIdPipe) idStudent: string,
    ) {
        try {
            const user: PayloadToken = req.user
            await this.studentsService.updateStudent(
                student,
                idStudent,
                user._id,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
