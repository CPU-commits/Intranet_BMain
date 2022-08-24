import { forwardRef, Module } from '@nestjs/common'
import { StudentsService } from './service/students.service'
import { StudentsController } from './controller/students.controller'
import { UsersModule } from '../users/users.module'
import { HistoryModule } from '../history/history.module'
import { MongooseModule } from '@nestjs/mongoose'
import { Student, StudentSchema } from './entities/student.entity'
import { KeyValue, KeyValueSchema } from '../college/entities/key_value.entity'
import { Voting, VotingSchema } from './entities/voting.entity'
import { SemestersModule } from '../semesters/semesters.module'
import { ClientsModule, Transport } from '@nestjs/microservices'
import config from 'src/config'
import { ConfigType } from '@nestjs/config'
import { Vote, VoteSchema } from './entities/vote.entity'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Student.name,
                schema: StudentSchema,
            },
            {
                name: KeyValue.name,
                schema: KeyValueSchema,
            },
            {
                name: Voting.name,
                schema: VotingSchema,
            },
            {
                name: Vote.name,
                schema: VoteSchema,
            },
        ]),
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
        forwardRef(() => UsersModule),
        HistoryModule,
        SemestersModule,
    ],
    providers: [StudentsService],
    controllers: [StudentsController],
    exports: [StudentsService],
})
export class StudentsModule {}
