import {
    BadRequestException,
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ClassroomService } from 'src/modules/classroom/service/classroom.service'
import { Course } from 'src/modules/courses/entities/course.entity'
import { CourseService } from 'src/modules/courses/service/course.service'
import { Collections } from 'src/modules/history/models/collections.model'
import { HistoryService } from 'src/modules/history/service/history.service'
import { SemesterDTO, SemesterUpdateDTO } from '../dtos/semester.dto'

import { Semester } from '../entities/semester.entity'

@Injectable()
export class SemestersService {
    constructor(
        @InjectModel(Semester.name) private semesterModel: Model<Semester>,
        private historyService: HistoryService,
        @Inject(forwardRef(() => CourseService))
        private coursesService: CourseService,
        @Inject(forwardRef(() => ClassroomService))
        private classroomService: ClassroomService,
    ) {}

    async getSemesterExists(year: number, semester: number) {
        return await this.semesterModel.findOne({
            year,
            semester,
        })
    }

    async getSemesterByID(id: string) {
        return await this.semesterModel.findById(id)
    }

    async getCurrentSemester() {
        return await this.semesterModel
            .findOne({
                status: 2,
            })
            .exec()
    }

    async getSemesters() {
        return await this.semesterModel
            .find()
            .sort({ year: -1, semester: -1 })
            .exec()
    }

    async newSemester(semester: SemesterDTO, userId: string) {
        const getSemester = await this.getSemesterExists(
            semester.year,
            semester.semester,
        )
        if (getSemester)
            throw new ConflictException(
                'Ya existe un semestre con este año y semestre',
            )
        const newSemester = new this.semesterModel(semester)
        await newSemester.save()
        this.historyService.insertChange(
            `Se ha añadido el semestre ${semester.year} ${semester.semester}`,
            Collections.SEMESTER,
            userId,
            'add',
        )
        return newSemester
    }

    async initSemester(idSemester: string, idUser: string) {
        // Validate
        const semester = await this.getSemesterByID(idSemester)
        if (!semester) throw new NotFoundException('No existe el semestre')
        if (semester.status === 0)
            throw new BadRequestException('El semestre ya está finalizado')
        const currentSemester = await this.getCurrentSemester()
        if (
            currentSemester &&
            semester._id.toString() !== currentSemester._id.toString()
        )
            throw new ConflictException('Ya existe un semestre vigente')
        // Get courses
        const courses = (await this.coursesService.getCoursesSections())
            .courses as Course[]
        // Get modules
        const modulesData = await this.classroomService.getModulesSemester(
            idSemester,
        )
        // Modules
        const modules = []
        for (let i = 0; i < courses.length; i++) {
            const course = courses[i]
            course.sections.map((section) => {
                course.subjects.map((subject) => {
                    modules.push({
                        section: section._id.toString(),
                        subject: subject._id.toString(),
                        semester: idSemester,
                    })
                })
            })
        }
        const modulesFilter = modules.filter((module) => {
            if (
                !modulesData.some(
                    (m) =>
                        m.section === module.section &&
                        m.subject === module.subject &&
                        m.semester === module.semester,
                )
            )
                return module
        })
        console.log(modulesFilter)
        const modulesAdded = await this.classroomService.addModules(
            modulesFilter,
        )
        await this.semesterModel
            .findByIdAndUpdate(
                idSemester,
                {
                    $set: {
                        status: 2,
                    },
                },
                { new: true },
            )
            .exec()
        this.historyService.insertChange(
            `Se ha inicializado el semestre`,
            Collections.SEMESTER,
            idUser,
            'add',
        )
        return modulesAdded
    }

    async updateSemester(
        semester: SemesterUpdateDTO,
        idSemester: string,
        userId: string,
    ) {
        const semesterExists = await this.getSemesterByID(idSemester)
        if (!semesterExists)
            throw new NotFoundException('No existe el semestre')
        const updatedSemester = await this.semesterModel
            .findByIdAndUpdate(
                idSemester,
                {
                    $set: semester,
                },
                { new: true },
            )
            .exec()
        this.historyService.insertChange(
            `Se ha actualizado el semestre ${semesterExists.year} ${semesterExists.semester} a ${updatedSemester.year} ${updatedSemester.semester}`,
            Collections.SEMESTER,
            userId,
            'update',
        )
        return updatedSemester
    }
}
