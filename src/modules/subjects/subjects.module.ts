import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CoursesModule } from '../courses/courses.module'
import { HistoryModule } from '../history/history.module'
import { SubjectsController } from './controller/subjects.controller'
import { Specialty, SpecialtySchema } from './entities/specialty.entity'
import { Subject, SubjectSchema } from './entities/subject.entity'
import { SubjectsService } from './service/subjects.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Subject.name,
                schema: SubjectSchema,
            },
            {
                name: Specialty.name,
                schema: SpecialtySchema,
            },
        ]),
        CoursesModule,
        HistoryModule,
    ],
    controllers: [SubjectsController],
    providers: [SubjectsService],
})
export class SubjectsModule {}
