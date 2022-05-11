import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { ModuleClass } from '../entities/module.entity'

@Injectable()
export class ClassroomService {
    constructor(
        @InjectModel(ModuleClass.name) private moduleModel: Model<ModuleClass>,
    ) {}

    async getModulesSemester(idSemester: string) {
        return await this.moduleModel
            .find({
                semester: idSemester,
            })
            .exec()
    }

    async addModules(modules: ModuleClass[]) {
        return await this.moduleModel.insertMany(modules)
    }
}
