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
import { ClassroomModule } from '../classroom/classroom.module'
import { AwsModule } from '../aws/aws.module'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { getNatsServers } from 'src/utils/get_nats_servers'

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
        ClassroomModule,
        AwsModule,
        ClientsModule.registerAsync([
            {
                name: 'NATS_CLIENT',
                useFactory: () => {
                    return {
                        transport: Transport.NATS,
                        options: {
                            servers: getNatsServers(),
                            queue: 'main',
                        },
                    }
                },
            },
        ]),
    ],
    providers: [CourseService],
    controllers: [CourseController],
    exports: [CourseService],
})
export class CoursesModule {}
