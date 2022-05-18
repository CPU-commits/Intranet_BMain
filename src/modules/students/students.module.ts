import { forwardRef, Module } from '@nestjs/common'
import { StudentsService } from './service/students.service'
import { StudentsController } from './controller/students.controller'
import { UsersModule } from '../users/users.module'
import { HistoryModule } from '../history/history.module'
import { MongooseModule } from '@nestjs/mongoose'
import { Student, StudentSchema } from './entities/student.entity'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Student.name,
                schema: StudentSchema,
            },
        ]),
        forwardRef(() => UsersModule),
        HistoryModule,
    ],
    providers: [StudentsService],
    controllers: [StudentsController],
    exports: [StudentsService],
})
export class StudentsModule {}
