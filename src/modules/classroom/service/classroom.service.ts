import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { StudentsService } from 'src/modules/students/service/students.service'

import { ModuleClass } from '../entities/module.entity'

@Injectable()
export class ClassroomService {
    constructor(
        @InjectModel(ModuleClass.name) private moduleModel: Model<ModuleClass>,
        private readonly studentsService: StudentsService,
    ) {}

    async getModuleFromId(idModule: string) {
        return await this.moduleModel.findById(idModule).exec()
    }

    async getModulesFromSection(idSection: string) {
        return await this.moduleModel
            .find({
                section: idSection,
                status: true,
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

    async getStudentsFromIdModule(idModule: string) {
        const module = await this.getModuleFromId(idModule)
        return await this.studentsService.getStudentsFromIdCourse(
            module.section.toString(),
        )
    }

    async addModules(modules: ModuleClass[]) {
        return await this.moduleModel.insertMany(modules)
    }
}
