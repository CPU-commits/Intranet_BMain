import {
    BadRequestException,
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model, ProjectionType } from 'mongoose'
import { v4 as uuid4 } from 'uuid'

import { AwsService } from 'src/modules/aws/service/aws.service'
import { ClassroomService } from 'src/modules/classroom/service/classroom.service'
import { Collections } from 'src/modules/history/models/collections.model'
import { HistoryService } from 'src/modules/history/service/history.service'
import { Teacher } from 'src/modules/teachers/entities/teacher.entity'
import { TeachersService } from 'src/modules/teachers/service/teachers.service'
import { User } from 'src/modules/users/entities/user.entity'
import { CourseDTO, UpdateCourseDTO } from '../dtos/course.dto'
import { Course } from '../entities/course.entity'
import { CourseLetter } from '../entities/course_letter.entity'

import { Cycle } from '../entities/cycle.entity'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'
import { File } from 'src/modules/aws/entities/file.entity'
import { OID } from 'src/common/oid.model'

@Injectable()
export class CourseService {
    constructor(
        @InjectModel(Cycle.name) private cycleModel: Model<Cycle>,
        @InjectModel(Course.name) private courseModel: Model<Course>,
        @InjectModel(CourseLetter.name)
        private sectionModel: Model<CourseLetter>,
        @Inject('NATS_CLIENT') private natsClient: ClientProxy,
        private historyService: HistoryService,
        @Inject(forwardRef(() => TeachersService))
        private teacherService: TeachersService,
        private classroomService: ClassroomService,
        private awsService: AwsService,
    ) {}

    async getCourseCustom(query = null, filter = null) {
        return await this.courseModel.findOne(query, filter).exec()
    }

    async getCoursesCustom(
        query: FilterQuery<Course> = null,
        filter: ProjectionType<Course> = null,
        count?: boolean,
        sections = true,
    ): Promise<Course[] | number> {
        const courses = this.courseModel
            .find(query, filter)
            .sort({ level: 1 })
            .populate('cycle', { cycle: 1 })
            .populate('subjects', { subject: 1 })
        if (sections)
            courses.populate('sections', {
                section: 1,
                header_teacher: 1,
                is_next_section_variable: 1,
            })
        if (count) courses.count()
        return await courses.exec()
    }

    async getSectionCustom(queryAdd?: any, filter = null) {
        const query = {
            $and: [{ status: true }, queryAdd],
        }
        return await this.courseModel.findOne(query, filter).exec()
    }

    async getSubjectSection(subjectId: string, sectionId: string) {
        const subject = await this.courseModel
            .findOne({
                subjects: { $in: [subjectId] },
                sections: { $in: [sectionId] },
            })
            .populate('subjects', { subject: 1 })
            .populate('course', { course: 1 })
            .exec()
        return subject
    }

    async getSections() {
        return await this.sectionModel
            .find({ status: true })
            .populate('course', { course: 1 })
            .exec()
    }

    async getVariableSections() {
        return await this.sectionModel
            .find({ status: true, is_next_section_variable: true })
            .populate('course', { course: 1, level: 1 })
            .exec()
    }

    async getCoursesSections() {
        const response = await Promise.all([
            this.getCoursesCustom(null, {
                course: 1,
                sections: 1,
                level: 1,
                cycle: 0,
            }),
            this.getSections(),
        ]).then((data) => {
            return {
                courses: data[0],
                sections: data[1],
            }
        })
        return response
    }

    async getCycles() {
        return await this.cycleModel.find().sort({ cycle: 1 }).exec()
    }

    async getCycleFromID(id: string) {
        return await this.cycleModel.findById(id).exec()
    }
    // Course
    private async getCourseByID(id: string) {
        return await this.courseModel
            .findById(id)
            .populate('cycle', { cycle: 1 })
            .populate('sections')
            .exec()
    }

    private async getCourseByLevel(level: number) {
        return await this.courseModel.findOne({ level }).exec()
    }

    async newCourse(course: CourseDTO, idUser: string) {
        const levelExists = await this.getCourseByLevel(course.level)
        if (levelExists)
            throw new ConflictException(
                'Este nivel/grado ya está asignado a otro curso',
            )
        const newCourse = new this.courseModel(course)
        this.historyService.insertChange(
            `Se añade el curso ${course.course}`,
            Collections.COURSE,
            idUser,
            'add',
        )
        await newCourse.save()
        return await this.getCourseByID(newCourse._id.toString())
    }

    async updateCourse(
        course: UpdateCourseDTO,
        idCourse: string,
        idUser: string,
    ) {
        const courseData = await this.getCourseByID(idCourse)
        if (courseData.level !== course.level) {
            const levelExists = await this.getCourseByLevel(course.level)
            if (levelExists)
                throw new ConflictException(
                    'Este nivel/grado ya está asignado a otro curso',
                )
        }
        if (!courseData.isFinal && course.isFinal) {
            const existsFinal = await this.getCoursesCustom(
                {
                    isFinal: true,
                },
                null,
                true,
            )
            if (existsFinal > 0)
                throw new ConflictException(
                    'No pueden existir dos cursos finales',
                )
        }
        await this.courseModel
            .findByIdAndUpdate(
                idCourse,
                {
                    $set: course,
                },
                { new: true },
            )
            .exec()
        this.historyService.insertChange(
            `Se actualiza el curso ${course.course}`,
            Collections.COURSE,
            idUser,
            'update',
        )
        return await this.getCourseByID(idCourse)
    }

    async deleteCourse(idCourse: string, idUser: string) {
        const course = await this.getCourseByID(idCourse)
        if (course.sections.length > 0)
            throw new ConflictException(
                'En el curso no deben existir secciones para ser eliminado',
            )
        const deletedCourse = await this.courseModel
            .findByIdAndRemove(idCourse)
            .exec()
        this.historyService.insertChange(
            `Se ha eliminado el curso ${course.course}`,
            Collections.COURSE,
            idUser,
            'delete',
        )
        return deletedCourse
    }
    // Sections
    private async getSectionById(sectionId: string) {
        return await this.sectionModel
            .findOne({
                _id: sectionId,
                status: true,
            })
            .exec()
    }

    async allSectionsHaveNextSection() {
        const { sectionsWNextSecion, allSections } = await Promise.all([
            this.sectionModel
                .find(
                    {
                        $and: [
                            {
                                $or: [
                                    { next_section: { $exists: true } },
                                    { is_next_section_variable: true },
                                ],
                            },
                            { status: true },
                        ],
                    },
                    { _id: 1, course: 1 },
                )
                .populate('course', { isFinal: 1 })
                .exec(),
            this.sectionModel
                .find(
                    { status: true },
                    { _id: 1, course: 1, is_next_section_variable: 1 },
                )
                .populate('course', { isFinal: 1 })
                .exec(),
        ]).then((data) => {
            const getSectionsIsNotFinal = (section: CourseLetter) => {
                const course = section.course as Course
                if (!course.isFinal) return section
            }
            return {
                sectionsWNextSecion: data[0].filter(getSectionsIsNotFinal),
                allSections: data[1].filter(getSectionsIsNotFinal),
            }
        })
        return sectionsWNextSecion.length === allSections.length
    }

    async getSectionsFromCourse(courseId: string, getFiles = true) {
        const sections = await this.sectionModel
            .find({ course: courseId, status: true })
            .populate('file', { key: 1, title: 1 })
            .populate({
                path: 'next_section',
                select: 'section course',
                populate: {
                    path: 'course',
                    select: 'course',
                },
            })
            .exec()
        if (getFiles && sections.length > 0) {
            const images = await lastValueFrom(
                this.natsClient.send(
                    'get_aws_token_access',
                    sections.map((section) => {
                        const file = section.file as File
                        return file.key
                    }),
                ),
            )
            return sections.map((section, i) => {
                const file = section.file as File
                return {
                    _id: section._id,
                    is_next_section_variable: section.is_next_section_variable,
                    section: section.section,
                    file: {
                        url: images[i],
                        title: file.title,
                    },
                    next_section: section.next_section,
                    header_teacher: section.header_teacher,
                }
            })
        }
        return sections
    }

    async getSectionsNextLevel(idCourse: string) {
        const course = await this.getCourseByID(idCourse)
        if (!course) throw new NotFoundException('No existe el curso')
        if (course.isFinal)
            throw new BadRequestException(
                'El curso final no tiene siguientes cursos',
            )
        const nextCourse = await this.getCourseByLevel(course.level + 1)
        if (!nextCourse)
            throw new BadRequestException(
                'Registre el siguiente nivel para obtener el siguiente curso',
            )
        const sections = await this.getSectionsFromCourse(
            nextCourse._id.toString(),
        )
        return {
            course: nextCourse,
            sections,
        }
    }

    async newSection(
        section: string,
        file: Express.Multer.File,
        idCourse: string,
        idUser: string,
    ) {
        const course = await this.getCourseByID(idCourse)
        if (!course) throw new NotFoundException('No existe el curso')
        // Upload file
        const extension = file.originalname.split('.')
        const key = `sections/${uuid4()}.${extension[extension.length - 1]}`
        await this.awsService.uploadFileAWS(file.buffer, key)
        const message: File & OID = await lastValueFrom(
            this.natsClient.send('upload_image', key),
        )
        // Create section
        const newSection = new this.sectionModel({
            section,
            file: message._id.$oid,
            course: course._id.toString(),
        })
        await newSection.save()
        await course
            .updateOne(
                {
                    $push: {
                        sections: newSection._id.toString(),
                    },
                },
                { new: true },
            )
            .exec()
        this.historyService.insertChange(
            `Se ha agregado la sección ${section} al curso ${course.course}`,
            Collections.COURSE,
            idUser,
            'add',
        )
        // Get image
        const imageUrl = await lastValueFrom(
            this.natsClient.send('get_aws_token_access', [message.key]),
        )
        return {
            section: newSection.section,
            _id: newSection._id,
            file: {
                url: imageUrl[0],
            },
        }
    }

    async addTeacherSection(
        idSection: string,
        idTeacher: string,
        idUser: string,
    ) {
        const teacherExists = await this.teacherService.getTeacherByID(
            idTeacher,
        )
        const section = await this.getSectionById(idSection)
        if (!section) throw new NotFoundException('La sección no existe')
        if (!teacherExists) throw new NotFoundException('El profesor no existe')
        const teacherAsig = await this.sectionModel.findOne({
            header_teacher: idTeacher,
        })
        if (teacherAsig)
            throw new ConflictException(
                'El profesor está asignado a otro curso',
            )
        const teacher = teacherExists.user as User
        const teacherAdded = await this.sectionModel
            .findByIdAndUpdate(
                idSection,
                {
                    $set: {
                        header_teacher: idTeacher,
                    },
                },
                { new: true },
            )
            .exec()
        this.historyService.insertChange(
            `Se ha asignado el profesor ${teacher.name} ${teacher.first_lastname} a la sección ${section.section}`,
            Collections.COURSE,
            idUser,
            'update',
        )
        return teacherAdded
    }

    async removeTeacherSection(idSection: string, idUser: string) {
        const section = await (
            await this.getSectionById(idSection)
        ).populate({
            path: 'header_teacher',
            select: 'user',
            populate: {
                path: 'user',
                select: 'name first_lastname',
            },
        })
        if (!section) throw new NotFoundException('La sección no existe')
        if (!section.header_teacher)
            throw new BadRequestException(
                'Este curso no tiene asignado ningún profesor',
            )
        await this.sectionModel
            .findByIdAndUpdate(
                idSection,
                {
                    $unset: {
                        header_teacher: '',
                    },
                },
                { new: true },
            )
            .exec()
        const teacher = section.header_teacher as Teacher
        const user = teacher.user as User
        this.historyService.insertChange(
            `Se ha desasignado el profesor ${user.name} ${user.first_lastname} de la sección ${section.section}`,
            Collections.COURSE,
            idUser,
            'update',
        )
        return true
    }

    async changeSectionImage(
        file: Express.Multer.File,
        idSection: string,
        idUser: string,
    ) {
        const section = await (
            await this.getSectionById(idSection)
        ).populate('file')
        if (!section) throw new NotFoundException('La sección no existe')
        // Upload file
        const extension = file.originalname.split('.')
        const key = `sections/${uuid4()}.${extension[extension.length - 1]}`
        await this.awsService.uploadFileAWS(file.buffer, key)
        const message: File & OID = await lastValueFrom(
            this.natsClient.send('upload_image', key),
        )
        // Delete actual file
        const fileSection = section.file as File
        await this.awsService.deleteFileAWS(fileSection.key)
        this.natsClient.emit('delete_image', section.file)
        // Update
        section
            .updateOne(
                {
                    $set: {
                        file: message._id.$oid,
                    },
                },
                { new: true },
            )
            .exec()
        // Get image url
        const image = await lastValueFrom(
            this.natsClient.send('get_aws_token_access', [message.key]),
        )
        this.historyService.insertChange(
            `Se ha cambiado la imágen de la sección ${section.section}`,
            Collections.COURSE,
            idUser,
            'update',
        )
        return image[0]
    }

    async selectNextSection(
        idSection: string,
        idUser: string,
        idNextSection?: string,
    ) {
        let message: string
        if (idNextSection) {
            const { section, nextSection } = await Promise.all([
                this.getSectionById(idSection),
                this.getSectionById(idNextSection),
            ])
                .then((data) => {
                    if (!data[0] || !data[1])
                        throw new NotFoundException(
                            'Alguna de las dos secciones no existe',
                        )
                    return {
                        section: data[0],
                        nextSection: data[1],
                    }
                })
                .then(async (sections) => {
                    const courses = await Promise.all([
                        this.getCourseByID(sections.section.course.toString()),
                        this.getCourseByID(
                            sections.nextSection.course.toString(),
                        ),
                    ]).then((data) => {
                        return {
                            course: data[0],
                            nextCourse: data[1],
                        }
                    })
                    if (courses.course.level >= courses.nextCourse.level)
                        throw new BadRequestException(
                            'La primera sección debe tener un nivel menor a la siguiente',
                        )
                    return {
                        section: {
                            course: courses.course,
                            section: sections.section,
                        },
                        nextSection: {
                            course: courses.nextCourse,
                            section: sections.nextSection,
                        },
                    }
                })
            await this.sectionModel
                .findByIdAndUpdate(
                    idSection,
                    {
                        $set: {
                            next_section: idNextSection,
                            is_next_section_variable: false,
                        },
                    },
                    { new: true },
                )
                .exec()
            message = `Se actualiza la "siguiente sección" de la sección
                ${section.course.course} -
                ${section.section.section} a
                ${nextSection.course.course}
                ${nextSection.section.section}`
        } else {
            const section = await this.getSectionById(idSection)
            if (!section)
                throw new NotFoundException('No existe la sección a actualizar')
            const course = await this.getCourseByID(section.course.toString())
            await this.sectionModel
                .findByIdAndUpdate(
                    idSection,
                    {
                        $set: {
                            is_next_section_variable: true,
                        },
                        $unset: {
                            next_section: '',
                        },
                    },
                    { new: true },
                )
                .exec()
            message = `Se actualiza la "siguiente sección" de la sección
                ${course.course} -
                ${section.section} a tipo variable`
        }
        this.historyService.insertChange(
            message,
            Collections.COURSE,
            idUser,
            'update',
        )
    }

    async deleteSection(idSection: string, idUser: string) {
        const section = await this.getSectionById(idSection)
        if (!section) throw new NotFoundException('No existe la sección')
        const modules = await this.classroomService.getModulesFromSection(
            idSection,
        )
        if (modules.length > 0)
            throw new ConflictException(
                'No se puede eliminar la sección, conflicto con Aula Virtual',
            )
        const deletedSection = await this.sectionModel
            .findByIdAndUpdate(idSection, {
                $set: {
                    status: false,
                },
            })
            .exec()
        await this.courseModel
            .findByIdAndUpdate(section.course, {
                $pull: {
                    sections: {
                        $in: [section._id],
                    },
                },
            })
            .exec()
        this.historyService.insertChange(
            `Se ha eliminado la sección ${section.section}`,
            Collections.COURSE,
            idUser,
            'delete',
        )
        return deletedSection
    }
    // Cycle
    async newCycle(cycle: string, idUser: string) {
        const newCycle = new this.cycleModel({
            cycle,
        })
        this.historyService.insertChange(
            `Se añade el ciclo ${cycle}`,
            Collections.CYCLE,
            idUser,
            'add',
        )
        return await newCycle.save()
    }

    async deleteCycle(cycleId: string, idUser: string) {
        const cycle = await this.getCycleFromID(cycleId)
        if (!cycle) throw new NotFoundException('No existe el ciclo')
        const isUsed = await this.getCoursesCustom(
            {
                cycle: cycleId,
            },
            null,
            true,
        )
        if (isUsed > 0)
            throw new ConflictException(
                'Este ciclo está siendo usado por algún curso',
            )
        this.historyService.insertChange(
            `Se elimina el ciclo ${cycle.cycle}`,
            Collections.CYCLE,
            idUser,
            'delete',
        )
        return await this.cycleModel.findByIdAndRemove(cycleId).exec()
    }
}
