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
import { Request, Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { PayloadToken } from 'src/auth/models/token.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { AnchorDTO } from '../dtos/anchor.dto'
import { SpecialtyDTO } from '../dtos/specialty.dto'
import { SubjectDTO } from '../dtos/subject.dto'
import { SubjectsService } from '../service/subjects.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/subjects')
export class SubjectsController {
    constructor(private subjectService: SubjectsService) {}

    // Subjects
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

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/new_subject')
    async newSubject(
        @Res() res: Response,
        @Req() req: Request,
        @Body() subject: SubjectDTO,
    ) {
        try {
            const user: PayloadToken = req.user
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

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Delete('/delete_subject/:id')
    async deleteSubject(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) idSubject: string,
    ) {
        try {
            const user: PayloadToken = req.user
            await this.subjectService.deleteSubject(idSubject, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
    // Specialties
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

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/new_specialty')
    async newSpecialty(
        @Res() res: Response,
        @Req() req: Request,
        @Body() specialty: SpecialtyDTO,
    ) {
        try {
            const user: PayloadToken = req.user
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

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Delete('/delete_specialty/:id')
    async deleteSpecialty(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) idSpecialty: string,
    ) {
        try {
            const user: PayloadToken = req.user
            await this.subjectService.deleteSpecialty(idSpecialty, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    // Anchor
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/add_subject')
    async addSubject(
        @Res() res: Response,
        @Req() req: Request,
        @Body() anchor: AnchorDTO,
    ) {
        try {
            const user: PayloadToken = req.user
            await this.subjectService.addSubject(anchor, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
