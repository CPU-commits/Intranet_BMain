import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { StudentsModule } from '../students/students.module'
import { ModuleClass, ModuleClassSchema } from './entities/module.entity'
import { ClassroomService } from './service/classroom.service'
import { ClassroomController } from './controllers/classroom.controller'
import {
    ModuleHistory,
    ModuleHistorySchema,
} from './entities/module_history.entity'
import { KeyValue, KeyValueSchema } from '../college/entities/key_value.entity'
import { NatsController } from './controllers/nats/nats.controller'
import { SemestersModule } from '../semesters/semesters.module'
import { DirectivesService } from './service/directives.service'
import { DirectivesController } from './controllers/directives/directives.controller'
import { Directive, DirectiveSchema } from './entities/directive.entity'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { getNatsServers } from 'src/utils/get_nats_servers'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: ModuleClass.name,
                schema: ModuleClassSchema,
            },
            {
                name: ModuleHistory.name,
                schema: ModuleHistorySchema,
            },
            {
                name: KeyValue.name,
                schema: KeyValueSchema,
            },
            {
                name: Directive.name,
                schema: DirectiveSchema,
            },
        ]),
        forwardRef(() => StudentsModule),
        forwardRef(() => SemestersModule),
        ClientsModule.registerAsync([
            {
                name: 'NATS_CLIENT',
                useFactory: () => {
                    return {
                        transport: Transport.NATS,
                        options: {
                            servers: getNatsServers(),
                        },
                    }
                },
            },
        ]),
    ],
    providers: [ClassroomService, DirectivesService],
    exports: [ClassroomService],
    controllers: [ClassroomController, NatsController, DirectivesController],
})
export class ClassroomModule {}
