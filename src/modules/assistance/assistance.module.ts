import { Module } from '@nestjs/common'
import { AssistanceController } from './controllers/assistance/assistance.controller'
import { AssistanceService } from './services/assistance/assistance.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Assistance, AssistanceSchema } from './entities/assistance.entity'
import { CoursesModule } from '../courses/courses.module'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Assistance.name,
                schema: AssistanceSchema,
            },
        ]),
        CoursesModule,
    ],
    controllers: [AssistanceController],
    providers: [AssistanceService],
})
export class AssistanceModule {}
