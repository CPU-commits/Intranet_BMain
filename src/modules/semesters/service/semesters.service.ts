import {
    BadRequestException,
    ConflictException,
    forwardRef,
    Inject,
    Injectable,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectId } from 'mongodb'
import { Model } from 'mongoose'
import { lastValueFrom } from 'rxjs'
import { NotifyGlobal, NotifyGlobalChannel } from 'src/models/notify.model'
import { Directive } from 'src/modules/classroom/entities/directive.entity'
import { ModuleClass } from 'src/modules/classroom/entities/module.entity'
import { ModuleHistory } from 'src/modules/classroom/entities/module_history.entity'
import { ClassroomService } from 'src/modules/classroom/service/classroom.service'
import { KeyValue } from 'src/modules/college/entities/key_value.entity'
import { Course } from 'src/modules/courses/entities/course.entity'
import { CourseService } from 'src/modules/courses/service/course.service'
import { Collections } from 'src/modules/history/models/collections.model'
import { HistoryService } from 'src/modules/history/service/history.service'
import { User } from 'src/modules/users/entities/user.entity'
import { VariableSectionStudentDTO } from '../dtos/finish_semester.dto,'
import { SemesterDTO, SemesterUpdateDTO } from '../dtos/semester.dto'
import { NextSectionStudent } from '../entities/next_section_student'
import { RepeatingStudent } from '../entities/repeating_student.entity'

import { Semester } from '../entities/semester.entity'
import { CloseDateKey } from '../models/close_date'
import {
    CurrentSemesterStatus,
    CurrentSemesterStatusKey,
    SemesterStatus,
} from '../models/semester_status.model'

@Injectable()
export class SemestersService {
    constructor(
        @InjectModel(Semester.name) private semesterModel: Model<Semester>,
        private historyService: HistoryService,
        @Inject(forwardRef(() => CourseService))
        private coursesService: CourseService,
        @Inject(forwardRef(() => ClassroomService))
        private classroomService: ClassroomService,
        @InjectModel(Directive.name)
        private readonly directivesModel: Model<Directive>,
        @InjectModel(RepeatingStudent.name)
        private readonly repeatingStudentModel: Model<RepeatingStudent>,
        @InjectModel(ModuleHistory.name)
        private readonly moduleHistoryModel: Model<ModuleHistory>,
        @InjectModel(ModuleClass.name)
        private readonly moduleModel: Model<ModuleClass>,
        @InjectModel(KeyValue.name)
        private readonly keyValueModel: Model<KeyValue>,
        @InjectModel(NextSectionStudent.name)
        private readonly nextSectionStudentModel: Model<NextSectionStudent>,
        @Inject('NATS_CLIENT') private readonly natsClient: ClientProxy,
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

    async getLastSemester(idSemester: string) {
        const semester = await this.getSemesterByID(idSemester)
        return await this.semesterModel
            .findOne({
                semester: semester.semester === 2 ? 1 : 2,
                year:
                    semester.semester === 2 ? semester.year : semester.year - 1,
            })
            .exec()
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

    async getSemesterFromIdSemesters(semesters: Array<ObjectId>) {
        return await this.semesterModel
            .find({
                _id: {
                    $in: semesters,
                },
            })
            .exec()
    }

    async getSemestersFromYear(year: number) {
        return await this.semesterModel
            .find({ year })
            .sort({ year: -1, semester: -1 })
            .exec()
    }

    async getRepeatingStudents(idSemester: ObjectId) {
        return await this.repeatingStudentModel
            .findOne({ semester: idSemester })
            .populate('students', { name: 1, first_lastname: 1, rut: 1 })
            .exec()
    }

    async getYears() {
        return (
            await this.semesterModel
                .aggregate([
                    {
                        $group: {
                            _id: '$year',
                        },
                    },
                ])
                .exec()
        )
            .map((semester) => {
                return {
                    year: semester._id as number,
                }
            })
            .sort((a, b) => a.year - b.year)
    }

    async getFinishSemester() {
        const closeDateSemester = await this.keyValueModel
            .findOne({
                key: CloseDateKey,
            })
            .exec()
        return {
            semester_status: await this.getCurrentSemesterStatus(),
            close_date_semester: closeDateSemester?.value ?? undefined,
        }
    }

    async getCurrentSemesterStatus(): Promise<CurrentSemesterStatus> {
        const status = (await this.keyValueModel
            .findOne({
                key: CurrentSemesterStatusKey,
            })
            .exec()) as CurrentSemesterStatus
        if (!status) {
            const newStatus = new this.keyValueModel({
                key: CurrentSemesterStatusKey,
                value: 'working',
            })
            return (await newStatus.save()) as CurrentSemesterStatus
        }
        return status
    }

    async getParticipatedSemesters(idUser: string) {
        const modules: Array<ObjectId> = await this.moduleHistoryModel
            .distinct('module', {
                students: {
                    $in: [new ObjectId(idUser)],
                },
            })
            .exec()
        const semesters: Array<string> = await this.moduleModel
            .distinct('semester', {
                _id: {
                    $in: modules,
                },
            })
            .exec()
        return await this.getSemesterFromIdSemesters(
            semesters.map((semester) => new ObjectId(semester)),
        )
    }

    async updateStatusCurrentSemester(status: keyof typeof SemesterStatus) {
        await this.getCurrentSemesterStatus()
        return await this.keyValueModel
            .findOneAndUpdate(
                {
                    key: CurrentSemesterStatusKey,
                },
                { $set: { value: status } },
                { new: true },
            )
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
        this.historyService.insertChange({
            change: `Se ha añadido el semestre ${semester.year} ${semester.semester}`,
            collection_name: Collections.SEMESTER,
            who: userId,
            type_change: 'add',
        })
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
        // Check if all sections have next section
        const allSections =
            await this.coursesService.allSectionsHaveNextSection()
        if (!allSections)
            throw new ConflictException(
                'Todos las secciones de los cursos deben tener asignado una sección siguiente',
            )
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
        this.historyService.insertChange({
            change: `Se ha inicializado el semestre`,
            collection_name: Collections.SEMESTER,
            who: idUser,
            type_change: 'add',
        })
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
        this.historyService.insertChange({
            change: `Se ha actualizado el semestre ${semesterExists.year} ${semesterExists.semester} a ${updatedSemester.year} ${updatedSemester.semester}`,
            collection_name: Collections.SEMESTER,
            who: userId,
            type_change: 'update',
        })
        return updatedSemester
    }

    async finishSemester(
        idUser: string,
        studentsRepeat?: Array<ObjectId>,
        studentsNextCourses?: Array<VariableSectionStudentDTO>,
    ) {
        const semesterStatus = await this.getCurrentSemesterStatus()
        if (semesterStatus.value === 'ending')
            throw new BadRequestException(
                'Actualmente ya está un proceso de finalización de semestre',
            )
        const semester = await this.getCurrentSemester()
        if (!semester)
            throw new ConflictException(
                'No existe semestre vigente que finalizar',
            )
        const modules = await this.classroomService.getModulesCurrentSemester()
        const directives = await Promise.all(
            modules.map(async (_module) => {
                const directive = await this.directivesModel
                    .findOne({
                        module: _module._id,
                    })
                    .exec()
                if (directive) {
                    const validateDirectives: {
                        success: boolean
                        messages: Array<string>
                    } = await lastValueFrom(
                        this.natsClient.send(
                            'validate_directives_module',
                            directive,
                        ),
                    )
                    return validateDirectives
                }
                return {
                    success: true,
                }
            }),
        )
        if (
            directives.filter((_module) => {
                if (!_module.success) return _module
            }).length > 0
        )
            throw new ConflictException(
                'No todos los módulos cumplen las directivas. Consulte las directivas de módulos',
            )
        if (semester.semester === 2) {
            // Validate variable sections
            const variableSections =
                await this.coursesService.getVariableSections()
            await Promise.all(
                variableSections.map(async (section) => {
                    const students =
                        await this.classroomService.getStudentsByIdCourse(
                            section._id.toString(),
                        )
                    students.forEach((student) => {
                        if (
                            !studentsNextCourses?.some((s) => {
                                const user = student.user as User & {
                                    _id: ObjectId
                                }
                                if (user._id.toString() === s.student) {
                                    return s
                                }
                            }) &&
                            !studentsRepeat?.some((s) => {
                                const user = student.user as User & {
                                    _id: ObjectId
                                }
                                if (s.toString() === user._id.toString()) {
                                    return s
                                }
                            })
                        )
                            throw new BadRequestException(
                                'Alguno de los alumnos de secciones variables no tiene asignado un siguiente curso o repite',
                            )
                    })
                }),
            )
            // Delete old next section students
            await this.nextSectionStudentModel.deleteMany().exec()
            if (variableSections.length) {
                // Inserts all
                await this.nextSectionStudentModel.insertMany(
                    studentsNextCourses.map((student) => {
                        return {
                            student: new ObjectId(student.student),
                            section: new ObjectId(student.id_next_section),
                        }
                    }),
                )
            }
            // Register repeating students
            if (studentsRepeat) {
                const repeating = await this.repeatingStudentModel
                    .findOne({
                        semester: semester._id,
                    })
                    .exec()
                if (repeating) {
                    await this.repeatingStudentModel
                        .findOneAndUpdate(
                            {
                                semester: semester._id,
                            },
                            { $set: { students: studentsRepeat } },
                            { new: true },
                        )
                        .exec()
                } else {
                    const newRepeating = new this.repeatingStudentModel({
                        date: new Date(),
                        students: studentsRepeat,
                        semester: semester._id,
                    })
                    await newRepeating.save()
                }
            }
        }
        // Update current semester status
        await this.updateStatusCurrentSemester('ending')
        // Schedule close
        this.natsClient.emit('close_semester', '')
        // History
        this.historyService.insertChange({
            change: 'Se programa para tres días despues el cierre de semestre',
            collection_name: Collections.SEMESTER,
            who: idUser,
            type_change: 'close',
        })
        // Emit notifications
        this.natsClient.emit(NotifyGlobalChannel, {
            Title: 'El cierre de semestre se aproxima',
            Link: '/inicio',
            Type: 'global',
        } as NotifyGlobal)
        return directives
    }

    async interruptFinishSemester(idUser: string) {
        const statusCurrentSemester = await this.getCurrentSemesterStatus()
        if (statusCurrentSemester.value === 'working')
            throw new NotAcceptableException(
                'Ningun proceso de finalización de semestre vigente',
            )
        // Interrupt
        await this.updateStatusCurrentSemester('working')
        this.natsClient.emit('interrupt_finish_semester', '')

        this.historyService.insertChange({
            change: 'Se ha interrumpido el proceso de finalización de semestre',
            collection_name: Collections.SEMESTER,
            who: idUser,
            type_change: 'close',
        })
    }
}
