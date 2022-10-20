import { forwardRef, Module } from '@nestjs/common'
import { SemestersService } from './service/semesters.service'
import { SemestersController } from './controllers/semesters.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Semester, SemesterSchema } from './entities/semester.entity'
import { HistoryModule } from '../history/history.module'
import { CoursesModule } from '../courses/courses.module'
import { ClassroomModule } from '../classroom/classroom.module'
import { NatsController } from './controllers/nats/nats.controller'
import {
    Directive,
    DirectiveSchema,
} from '../classroom/entities/directive.entity'
import { ClientsModule, Transport } from '@nestjs/microservices'
import config from 'src/config'
import { ConfigType } from '@nestjs/config'
import {
    RepeatingStudent,
    RepeatingStudentSchema,
} from './entities/repeating_student.entity'
import { KeyValue, KeyValueSchema } from '../college/entities/key_value.entity'
import {
    ModuleHistory,
    ModuleHistorySchema,
} from '../classroom/entities/module_history.entity'
import {
    ModuleClass,
    ModuleClassSchema,
} from '../classroom/entities/module.entity'
import {
    NextSectionStudent,
    NextSectionStudentSchema,
} from './entities/next_section_student'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Semester.name,
                schema: SemesterSchema,
            },
            {
                name: Directive.name,
                schema: DirectiveSchema,
            },
            {
                name: RepeatingStudent.name,
                schema: RepeatingStudentSchema,
            },
            {
                name: KeyValue.name,
                schema: KeyValueSchema,
            },
            {
                name: ModuleHistory.name,
                schema: ModuleHistorySchema,
            },
            {
                name: ModuleClass.name,
                schema: ModuleClassSchema,
            },
            {
                name: NextSectionStudent.name,
                schema: NextSectionStudentSchema,
            },
        ]),
        forwardRef(() => CoursesModule),
        ClassroomModule,
        ClientsModule.registerAsync([
            {
                name: 'NATS_CLIENT',
                inject: [config.KEY],
                useFactory: (configService: ConfigType<typeof config>) => {
                    return {
                        transport: Transport.NATS,
                        options: {
                            servers: [`nats://${configService.nats}:4222`],
                        },
                    }
                },
            },
        ]),
        HistoryModule,
    ],
    providers: [SemestersService],
    controllers: [SemestersController, NatsController],
    exports: [SemestersService],
})
export class SemestersModule {}
