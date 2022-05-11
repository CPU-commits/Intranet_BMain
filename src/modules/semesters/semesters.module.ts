import { Module } from '@nestjs/common'
import { SemestersService } from './service/semesters.service'
import { SemestersController } from './controller/semesters.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Semester, SemesterSchema } from './entities/semester.entity'
import { HistoryModule } from '../history/history.module'
import { CoursesModule } from '../courses/courses.module'
import { ClassroomModule } from '../classroom/classroom.module'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Semester.name,
                schema: SemesterSchema,
            },
        ]),
        HistoryModule,
        CoursesModule,
        ClassroomModule,
    ],
    providers: [SemestersService],
    controllers: [SemestersController],
})
export class SemestersModule {}
