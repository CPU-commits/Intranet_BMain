import {
    Body,
    Controller,
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
import { User } from 'src/modules/users/entities/user.entity'
import { Types } from 'mongoose'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { StudentDTO, UpdateStudentDTO } from '../dtos/student.dto'
import { UpdateVotingDTO, VotingDTO } from '../dtos/voting.dto'
import { StudentsService } from '../service/students.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/students')
export class StudentsController {
    constructor(private studentsService: StudentsService) {}

    @Roles(Role.DIRECTOR, Role.DIRECTIVE, Role.TEACHER)
    @Get('/get_students')
    async getStudents(
        @Res() res: Response,
        @Query('skip') skip?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('total') getTotal?: boolean,
        @Query('actived') actived?: boolean,
    ) {
        try {
            const students = await this.studentsService.getStudents(
                search,
                skip,
                limit,
                getTotal,
                actived,
            )
            handleRes(res, students)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTOR, Role.DIRECTIVE, Role.TEACHER)
    @Get('/get_students_course/:idCourse')
    async getStudentsCourse(
        @Res() res: Response,
        @Param('idCourse', MongoIdPipe) idCourse: string,
    ) {
        try {
            const students = (
                await this.studentsService.getStudentsFromIdCourse(idCourse)
            ).map((student) => {
                const { _id, first_lastname, name, rut, second_lastname } =
                    student.user as User & { _id: Types.ObjectId }
                return {
                    _id,
                    first_lastname,
                    name,
                    rut,
                    second_lastname,
                }
            })
            handleRes(res, students)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Get('/get_voting_status')
    async getVotingStatus(@Res() res: Response) {
        try {
            const votingStatus = await this.studentsService.getVotingStatus()
            handleRes(res, {
                status: votingStatus,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Get('/get_voting')
    async getVoting(@Res() res: Response) {
        try {
            const voting = await this.studentsService.getVoting()
            handleRes(res, {
                voting,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.STUDENT, Role.STUDENT_DIRECTIVE)
    @Get('/get_my_vote')
    async getMyVote(@Res() res: Response, @Req() req: Request) {
        try {
            const user = req.user
            const myVote = await this.studentsService.getMyVote(user._id)
            handleRes(res, {
                my_vote: myVote,
            })
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
    @Post('/upload_voting')
    async uploadVoting(
        @Res() res: Response,
        @Req() req: Request,
        @Body() voting: VotingDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.studentsService.uploadVoting(voting, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.STUDENT, Role.STUDENT_DIRECTIVE)
    @Post('/vote/:id')
    async vote(
        @Res() res: Response,
        @Param('id', MongoIdPipe) idList: string,
        @Req() req: Request,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.studentsService.vote(user._id, idList)
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

    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Put('/edit_voting')
    async editVoting(
        @Res() res: Response,
        @Req() req: Request,
        @Body() voting: UpdateVotingDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            const votingData = await this.studentsService.updateVoting(
                voting,
                user._id,
            )
            handleRes(res, {
                voting: votingData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }
}
