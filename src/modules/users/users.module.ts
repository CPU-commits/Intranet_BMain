import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { UsersService } from './services/users/users.service'
// Entities
import { User, UserSchema } from './entities/user.entity'
import { UsersController } from './controller/users.controller'
import { StudentsModule } from '../students/students.module'
import { TeachersModule } from '../teachers/teachers.module'
import { HistoryModule } from '../history/history.module'
import { NatsController } from './controller/nats/nats.controller'
import { UsersToken, UsersTokenSchema } from './entities/users_token.entity'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { getNatsServers } from 'src/utils/get_nats_servers'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: User.name,
                schema: UserSchema,
            },
            {
                name: UsersToken.name,
                schema: UsersTokenSchema,
            },
        ]),
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
        HistoryModule,
        forwardRef(() => StudentsModule),
        forwardRef(() => TeachersModule),
    ],
    providers: [UsersService],
    exports: [UsersService],
    controllers: [UsersController, NatsController],
})
export class UsersModule {}
