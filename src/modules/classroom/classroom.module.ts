import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { StudentsModule } from '../students/students.module'
import { ModuleClass, ModuleClassSchema } from './entities/module.entity'
import { ClassroomService } from './service/classroom.service'
import { ClassroomController } from './controllers/classroom.controller'
import {
    ModuleHistory,
    ModuleHistorySchema,
} from './entities/module_history.entity'
import { KeyValue, KeyValueSchema } from '../college/entities/key_value.entity'
import { NatsController } from './controllers/nats/nats.controller'
import { SemestersModule } from '../semesters/semesters.module'

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
            {
                name: KeyValue.name,
                schema: KeyValueSchema,
            },
        ]),
        forwardRef(() => StudentsModule),
        forwardRef(() => SemestersModule),
    ],
    providers: [ClassroomService],
    exports: [ClassroomService],
    controllers: [ClassroomController, NatsController],
})
export class ClassroomModule {}
