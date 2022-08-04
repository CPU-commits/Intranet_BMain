import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { StudentsModule } from '../students/students.module'
import { ModuleClass, ModuleClassSchema } from './entities/module.entity'
import { ClassroomService } from './service/classroom.service'
import { ClassroomController } from './controller/classroom.controller'
import {
    ModuleHistory,
    ModuleHistorySchema,
} from './entities/module_history.entity'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: ModuleClass.name,
                schema: ModuleClassSchema,
            },
            {
                name: ModuleHistory.name,
                schema: ModuleHistorySchema,
            },
        ]),
        StudentsModule,
    ],
    providers: [ClassroomService],
    exports: [ClassroomService],
    controllers: [ClassroomController],
})
export class ClassroomModule {}
