import { forwardRef, Module } from '@nestjs/common'
import { SemestersService } from './service/semesters.service'
import { SemestersController } from './controllers/semesters.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Semester, SemesterSchema } from './entities/semester.entity'
import { HistoryModule } from '../history/history.module'
import { CoursesModule } from '../courses/courses.module'
import { ClassroomModule } from '../classroom/classroom.module'
import { NatsController } from './controllers/nats/nats.controller'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Semester.name,
                schema: SemesterSchema,
            },
        ]),
        HistoryModule,
        forwardRef(() => CoursesModule),
        ClassroomModule,
    ],
    providers: [SemestersService],
    controllers: [SemestersController, NatsController],
    exports: [SemestersService],
})
export class SemestersModule {}
