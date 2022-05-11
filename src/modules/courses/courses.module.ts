import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CourseService } from './service/course.service'
import { Cycle, CycleSchema } from './entities/cycle.entity'
import { Course, CourseSchema } from './entities/course.entity'
import { CourseController } from './controller/course.controller'
import { HistoryModule } from '../history/history.module'
import {
    CourseLetter,
    CourseLetterSchema,
} from './entities/course_letter.entity'
import { TeachersModule } from '../teachers/teachers.module'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Cycle.name,
                schema: CycleSchema,
            },
            {
                name: CourseLetter.name,
                schema: CourseLetterSchema,
            },
            {
                name: Course.name,
                schema: CourseSchema,
            },
        ]),
        HistoryModule,
        forwardRef(() => TeachersModule),
    ],
    providers: [CourseService],
    controllers: [CourseController],
    exports: [CourseService],
})
export class CoursesModule {}
