import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectId } from 'mongodb'
import { Model } from 'mongoose'
import { KeyValue } from 'src/modules/college/entities/key_value.entity'
import { SemestersService } from 'src/modules/semesters/service/semesters.service'
import { StudentsService } from 'src/modules/students/service/students.service'
import { GradeConfigDTO } from '../dtos/grade_config.dto'

import { ModuleClass } from '../entities/module.entity'
import { ModuleHistory } from '../entities/module_history.entity'
import { GradeConfigKeys } from '../models/grade_config.model'

@Injectable()
export class ClassroomService {
    constructor(
        @InjectModel(ModuleClass.name) private moduleModel: Model<ModuleClass>,
        @InjectModel(KeyValue.name)
        private readonly keyValueModel: Model<KeyValue>,
        @InjectModel(ModuleHistory.name)
        private readonly moduleHistoryModel: Model<ModuleHistory>,
        private readonly studentsService: StudentsService,
        private readonly semestersService: SemestersService,
    ) {}

    async getModuleFromId(idModule: string) {
        return await this.moduleModel.findById(idModule).exec()
    }

    async getModulesFromSection(idSection: string) {
        return await this.moduleModel
            .find({
                $and: [
                    { section: idSection },
                    { status: true },
                ]
            })
            .exec()
    }

    async getModulesSemester(idSemester: string) {
        return await this.moduleModel
            .find({
                semester: idSemester,
            })
            .exec()
    }

    async getPopulatedModulesSemester(idSemester: string) {
        return await this.moduleModel
            .find(
                {
                    semester: idSemester,
                },
                { sub_sections: 0, semester: 0 },
            )
            .populate({
                path: 'section',
                select: 'section course',
                populate: {
                    path: 'course',
                    select: 'course',
                },
            })
            .populate('subject')
            .exec()
    }

    async getModulesCurrentSemester() {
        const semester = await this.semestersService.getCurrentSemester()
        if (!semester) return []
        return await this.moduleModel
            .find(
                {
                    semester: semester._id.toString(),
                },
                { sub_sections: 0, semester: 0 },
            )
            .populate({
                path: 'section',
                select: 'section course',
                populate: {
                    path: 'course',
                    select: 'course',
                },
            })
            .populate('subject')
            .exec()
    }

    async getStudentsFromIdModule(idModule: string) {
        const idStudents = await this.moduleHistoryModel.findOne({
            module: new ObjectId(idModule),
        })
        if (idStudents) {
            const students = await this.studentsService.getStudentsFromIdsUser(idStudents.students.map((idStudent) => {
                return idStudent.toString()
            }))
            return students
        }
        const module = await this.getModuleFromId(idModule)
        const students = await this.studentsService.getStudentsFromIdCourse(
            module.section.toString(),
        )
        return students
    }

    async getStudentsByIdCourse(idCourse: string) {
        return await this.studentsService.getStudentsFromIdCourse(idCourse)
    }

    async getGradeConfig() {
        const gradeConfig: any = {}
        const gradeConfigData = await Promise.all([
            this.keyValueModel.findOne({ key: GradeConfigKeys.MIN }).exec(),
            this.keyValueModel.findOne({ key: GradeConfigKeys.MAX }).exec(),
        ])
        if (!gradeConfigData[0]) return gradeConfig
        gradeConfig[GradeConfigKeys.MIN] = gradeConfigData[0].value
        gradeConfig[GradeConfigKeys.MAX] = gradeConfigData[1].value
        return gradeConfig
    }

    async addModules(modules: ModuleClass[]) {
        return await this.moduleModel.insertMany(modules)
    }

    async updateGradesConfig(grade: GradeConfigDTO) {
        if (grade.min > grade.max)
            throw new BadRequestException(
                'La calificación máx. debe ser mayor a la mín.',
            )
        const min = await this.keyValueModel
            .findOne({
                key: GradeConfigKeys.MIN,
            })
            .exec()
        if (min) {
            return await Promise.all([
                this.keyValueModel
                    .findOneAndUpdate(
                        { key: GradeConfigKeys.MIN },
                        { $set: { value: grade.min } },
                        { new: true },
                    )
                    .exec(),
                this.keyValueModel
                    .findOneAndUpdate(
                        { key: GradeConfigKeys.MAX },
                        { $set: { value: grade.max } },
                        { new: true },
                    )
                    .exec(),
            ])
        } else {
            return await this.keyValueModel.insertMany([
                {
                    key: GradeConfigKeys.MIN,
                    value: grade.min,
                },
                {
                    key: GradeConfigKeys.MAX,
                    value: grade.max,
                },
            ])
        }
    }
}
