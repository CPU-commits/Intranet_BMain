import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
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
import { CourseDTO, UpdateCourseDTO } from '../dtos/course.dto'
import { CycleDTO } from '../dtos/cycle.dto'
import { SectionDTO } from '../dtos/section.dto'
import { CourseService } from '../service/course.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/course')
export class CourseController {
    constructor(private courseService: CourseService) {}
    // Courses
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_courses')
    async getCourses(@Res() res: Response) {
        try {
            const courses = await this.courseService.getCoursesCustom()
            handleRes(res, {
                courses,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/new_course')
    async newCourse(
        @Res() res: Response,
        @Req() req: Request,
        @Body() course: CourseDTO,
    ) {
        try {
            const user: PayloadToken = req.user
            const courseData = await this.courseService.newCourse(
                course,
                user._id,
            )
            handleRes(res, {
                course: courseData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Put('/update_course/:id')
    async updateCourse(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) idCourse: string,
        @Body() course: UpdateCourseDTO,
    ) {
        try {
            const user: PayloadToken = req.user
            const courseData = await this.courseService.updateCourse(
                course,
                idCourse,
                user._id,
            )
            handleRes(res, {
                course: courseData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Delete('/delete_course/:id')
    async deleteCourse(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) courseId: string,
    ) {
        try {
            const user: PayloadToken = req.user
            await this.courseService.deleteCourse(courseId, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
    // Sections
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_course_sections')
    async getCourseSections(@Res() res: Response) {
        try {
            const sections = await this.courseService.getCoursesSections()
            handleRes(res, {
                ...sections,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_sections')
    async getSections(@Res() res: Response) {
        try {
            const sections = await this.courseService.getSections()
            handleRes(res, {
                sections,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/new_section/:id')
    async newSection(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) idCourse: string,
        @Body() section: SectionDTO,
    ) {
        try {
            const user: PayloadToken = req.user
            const sectionData = await this.courseService.newSection(
                section.section,
                idCourse,
                user._id,
            )
            handleRes(res, {
                section: sectionData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/add_teacher_section/:id/:idC')
    async addTeacherSection(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) idTeacher: string,
        @Param('idC', MongoIdPipe) idSection: string,
    ) {
        try {
            const user: PayloadToken = req.user
            await this.courseService.addTeacherSection(
                idSection,
                idTeacher,
                user._id,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Delete('/delete_section/:id')
    async deleteSection(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) sectionId: string,
    ) {
        try {
            const user: PayloadToken = req.user
            await this.courseService.deleteSection(sectionId, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
    // Cycles
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_cycles')
    async getCycles(@Res() res: Response) {
        try {
            const cycles = await this.courseService.getCycles()
            handleRes(res, {
                cycles,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/new_cycle')
    async newCycle(
        @Res() res: Response,
        @Req() req: Request,
        @Body() cycle: CycleDTO,
    ) {
        try {
            const user: PayloadToken = req.user
            const cycleData = await this.courseService.newCycle(
                cycle.cycle,
                user._id,
            )
            handleRes(res, {
                cycle: cycleData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/delete_cycle/:id')
    async deleteCycle(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) idCycle: string,
    ) {
        try {
            const user: PayloadToken = req.user
            await this.courseService.deleteCycle(idCycle, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
