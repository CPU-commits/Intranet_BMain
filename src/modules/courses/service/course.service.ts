import {
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Collections } from 'src/modules/history/models/collections.model'
import { HistoryService } from 'src/modules/history/service/history.service'
import { TeachersService } from 'src/modules/teachers/service/teachers.service'
import { User } from 'src/modules/users/entities/user.entity'
import { CourseDTO, UpdateCourseDTO } from '../dtos/course.dto'
import { Course } from '../entities/course.entity'
import { CourseLetter } from '../entities/course_letter.entity'

import { Cycle } from '../entities/cycle.entity'

@Injectable()
export class CourseService {
    constructor(
        @InjectModel(Cycle.name) private cycleModel: Model<Cycle>,
        @InjectModel(Course.name) private courseModel: Model<Course>,
        @InjectModel(CourseLetter.name)
        private sectionModel: Model<CourseLetter>,
        private historyService: HistoryService,
        @Inject(forwardRef(() => TeachersService))
        private teacherService: TeachersService,
    ) {}

    async getCourseCustom(query = null, filter = null) {
        return await this.courseModel.findOne(query, filter).exec()
    }

    async getCoursesCustom(
        query = null,
        filter = null,
        count?: boolean,
    ): Promise<Course[] | number> {
        const courses = this.courseModel
            .find(query, filter)
            .sort({ level: 1 })
            .populate('cycle', { cycle: 1 })
            .populate('subjects', { subject: 1 })
            .populate('sections', { section: 1, header_teacher: 1 })
        if (count) courses.count()
        return await courses.exec()
    }

    async getSectionCustom(query = null, filter = null) {
        return await this.sectionModel.findOne(query, filter).exec()
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
            .find()
            .populate('course', { course: 1 })
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
        return await this.sectionModel.findById(sectionId).exec()
    }

    async newSection(section: string, idCourse: string, idUser: string) {
        const course = await this.getCourseByID(idCourse)
        if (!course) throw new NotFoundException('No existe el curso')
        const newSection = new this.sectionModel({
            section,
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
        return newSection
    }

    async addTeacherSection(
        idSection: string,
        idTeacher: string,
        idUser: string,
    ) {
        const teacherExists = await this.teacherService.getTeacherByID(
            idTeacher,
        )
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
            `Se ha asignado el profesor ${teacher.name} ${teacher.first_lastname}`,
            Collections.COURSE,
            idUser,
            'update',
        )
        return teacherAdded
    }

    async deleteSection(idSection: string, idUser: string) {
        const section = await this.getSectionById(idSection)
        if (!section) throw new NotFoundException('No existe la sección')
        const deletedSection = await this.sectionModel.findByIdAndDelete(
            idSection,
        )
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
