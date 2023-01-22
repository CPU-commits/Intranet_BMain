import {
    BadRequestException,
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
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
    ApiBody,
    ApiConsumes,
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
import { FileDTO } from 'src/modules/classroom/dtos/image.dto'
import { CycleRes } from 'src/modules/courses/res/cycle.res'
import { CyclesRes } from 'src/modules/courses/res/cycles.res'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { CourseDTO, UpdateCourseDTO } from '../dtos/course.dto'
import { CycleDTO } from '../dtos/cycle.dto'
import { SectionDTO } from '../dtos/section.dto'
import { CourseLetter } from '../entities/course_letter.entity'
import { CourseRes } from '../res/course.res'
import { CoursesRes } from '../res/courses.res'
import { CourseSectionsRes } from '../res/course_sections.res'
import { SectionRes } from '../res/section.res'
import { SectionsRes } from '../res/sections.res'
import { CourseService } from '../service/course.service'

@ApiTags('Main', 'Course', 'roles.directive', 'roles.director')
@ApiServiceUnavailableResponse({
    description: 'MongoDB || Nats service unavailable',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/course')
export class CourseController {
    constructor(private courseService: CourseService) {}
    // Courses
    @ApiExtraModels(CourseRes)
    @ApiOperation({
        description: 'Get course',
        summary: 'Get course',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(CourseRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_course/:idCourse')
    async getCourse(
        @Res() res: Response,
        @Param('idCourse', MongoIdPipe) idCourse: string,
    ) {
        try {
            const course = await this.courseService.getCourseCustom({
                _id: idCourse,
            })
            handleRes(res, {
                course,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(CoursesRes)
    @ApiOperation({
        description: 'Get courses',
        summary: 'Get courses',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(CoursesRes),
                        },
                    },
                },
            ],
        },
    })
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

    @ApiExtraModels(CoursesRes)
    @ApiOperation({
        description: 'New course',
        summary: 'New course',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(CoursesRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/new_course')
    async newCourse(
        @Res() res: Response,
        @Req() req: Request,
        @Body() course: CourseDTO,
    ) {
        try {
            const user = req.user as PayloadToken
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

    @ApiExtraModels(CourseRes)
    @ApiOperation({
        description: 'Update Course by Id',
        summary: 'Update Course',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(CoursesRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Put('/update_course/:idCourse')
    async updateCourse(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idCourse', MongoIdPipe) idCourse: string,
        @Body() course: UpdateCourseDTO,
    ) {
        try {
            const user = req.user as PayloadToken
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

    @ApiOperation({
        description: 'Delete course',
        summary: 'Delete course',
    })
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Delete('/delete_course/:idCourse')
    async deleteCourse(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idCourse', MongoIdPipe) courseId: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.courseService.deleteCourse(courseId, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
    // Sections
    @ApiExtraModels(CourseSectionsRes)
    @ApiOperation({
        summary: 'Get course sections',
        description: 'Get course sections',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(CourseSectionsRes),
                        },
                    },
                },
            ],
        },
    })
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

    @ApiExtraModels(SectionsRes)
    @ApiOperation({
        description: 'Get sections',
        summary: 'Get sections',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(SectionsRes),
                        },
                    },
                },
            ],
        },
    })
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

    @ApiExtraModels(SectionsRes)
    @ApiOperation({
        description: 'Get variable sections',
        summary: 'Get variable sections',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(SectionsRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_variable_sections')
    async getVariableSections(@Res() res: Response) {
        try {
            const sections = await this.courseService.getVariableSections()
            handleRes(res, {
                sections,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(SectionsRes)
    @ApiOperation({
        description: 'Get sections by course id',
        summary: 'Get sections course',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(SectionsRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_sections_course/:idCourse')
    async getSectionsCourse(
        @Res() res: Response,
        @Param('idCourse', MongoIdPipe) idCourse: string,
    ) {
        try {
            const sections = await this.courseService.getSectionsFromCourse(
                idCourse,
            )
            handleRes(res, {
                sections,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(SectionsRes)
    @ApiOperation({
        description: 'Get sections',
        summary: 'Get sections',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            type: 'array',
                            items: {
                                $ref: getSchemaPath(CourseLetter),
                            },
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_sections_next_level/:idCourse')
    async getSectionsNextLevel(
        @Res() res: Response,
        @Param('idCourse', MongoIdPipe) idCourse: string,
    ) {
        try {
            const sections = await this.courseService.getSectionsNextLevel(
                idCourse,
            )
            handleRes(res, sections)
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(SectionRes)
    @ApiOperation({
        summary: 'New section',
        description: 'New section in course (Id Course)',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(SectionRes),
                        },
                    },
                },
            ],
        },
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        type: SectionDTO,
        description: 'SectionDTO Model',
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/new_section/:idCourse')
    @UseInterceptors(FileInterceptor('image'))
    async newSection(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idCourse', MongoIdPipe) idCourse: string,
        @UploadedFile()
        file: Express.Multer.File,
        @Body() section: SectionDTO,
    ) {
        try {
            if (!file.mimetype.includes('image'))
                throw new BadRequestException('El archivo debe ser una imágen')
            const user = req.user as PayloadToken
            const sectionData = await this.courseService.newSection(
                section.section,
                file,
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

    @ApiOperation({
        description: 'Remove teacher to section',
        summary: 'Remove teacher section',
    })
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/remove_teacher_section/:idSection')
    async removeTeacherSection(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idSection', MongoIdPipe) idSection: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.courseService.removeTeacherSection(idSection, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        description: 'Add teacher to section',
        summary: 'Add teacher section',
    })
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(ResApi) },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/add_teacher_section/:idTeacher/:idSection')
    async addTeacherSection(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idTeacher', MongoIdPipe) idTeacher: string,
        @Param('idSection', MongoIdPipe) idSection: string,
    ) {
        try {
            const user = req.user as PayloadToken
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

    @ApiOperation({
        description: 'Add teacher to section',
        summary: 'Add teacher section',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        type: FileDTO,
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            type: 'string',
                            example:
                                'https://repository.com/file/$43Rd1!?token=0Dk1dsg!',
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Put('/change_image/:idSection')
    @UseInterceptors(FileInterceptor('image'))
    async changeImage(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idSection', MongoIdPipe) idSection: string,
        @UploadedFile()
        file: Express.Multer.File,
    ) {
        try {
            const user = req.user as PayloadToken
            const image = await this.courseService.changeSectionImage(
                file,
                idSection,
                user._id,
            )
            handleRes(res, image)
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        description: 'Select next section to section from id Section',
        summary: 'Select next section',
    })
    @ApiOkResponse({ schema: { $ref: getSchemaPath(ResApi) } })
    @ApiQuery({
        name: 'idNextSection',
        required: false,
        description: 'If idNextSection == null, nextSection unset',
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Put('/select_next_section/:idSection')
    async selectNextSection(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idSection', MongoIdPipe) idSection: string,
        @Query('idNextSection') idNextSection?: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.courseService.selectNextSection(
                idSection,
                user._id,
                idNextSection,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        summary: 'Delete section',
        description: 'Delete section',
    })
    @ApiOkResponse({ schema: { $ref: getSchemaPath(ResApi) } })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Delete('/delete_section/:idSection')
    async deleteSection(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idSection', MongoIdPipe) sectionId: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.courseService.deleteSection(sectionId, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
    // Cycles
    @ApiExtraModels(CyclesRes)
    @ApiOperation({
        description: 'Get cycles',
        summary: 'Get cycles',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(CyclesRes),
                        },
                    },
                },
            ],
        },
    })
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

    @ApiExtraModels(CycleRes)
    @ApiOperation({
        summary: 'New cycle',
        description: 'New cycle',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(CycleRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/new_cycle')
    async newCycle(
        @Res() res: Response,
        @Req() req: Request,
        @Body() cycle: CycleDTO,
    ) {
        try {
            const user = req.user as PayloadToken
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

    @ApiOperation({
        description: 'Delete cycle',
        summary: 'Delete cycle',
    })
    @ApiOkResponse({ schema: { $ref: getSchemaPath(ResApi) } })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/delete_cycle/:idCycle')
    async deleteCycle(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idCycle', MongoIdPipe) idCycle: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.courseService.deleteCycle(idCycle, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
