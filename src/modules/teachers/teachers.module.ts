import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CoursesModule } from '../courses/courses.module'
import { HistoryModule } from '../history/history.module'
import { UsersModule } from '../users/users.module'
import { TeachersController } from './controller/teachers.controller'
import { Teacher, TeacherSchema } from './entities/teacher.entity'
import { TeachersService } from './service/teachers.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Teacher.name,
                schema: TeacherSchema,
            },
        ]),
        HistoryModule,
        forwardRef(() => UsersModule),
        forwardRef(() => CoursesModule),
    ],
    controllers: [TeachersController],
    providers: [TeachersService],
    exports: [TeachersService],
})
export class TeachersModule {}
