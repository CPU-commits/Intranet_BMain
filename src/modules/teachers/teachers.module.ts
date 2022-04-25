import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
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
        UsersModule,
    ],
    controllers: [TeachersController],
    providers: [TeachersService],
})
export class TeachersModule {}
