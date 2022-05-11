import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ModuleClass, ModuleClassSchema } from './entities/module.entity'
import { ClassroomService } from './service/classroom.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: ModuleClass.name,
                schema: ModuleClassSchema,
            },
        ]),
    ],
    providers: [ClassroomService],
    exports: [ClassroomService],
})
export class ClassroomModule {}
