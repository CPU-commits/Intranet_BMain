import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { UsersService } from './services/users/users.service'
// Entities
import { User, UserSchema } from './entities/user.entity'
import { UsersController } from './controller/users.controller'
import { StudentsModule } from '../students/students.module'
import { TeachersModule } from '../teachers/teachers.module'
import { HistoryModule } from '../history/history.module'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: User.name,
                schema: UserSchema,
            },
        ]),
        HistoryModule,
        forwardRef(() => StudentsModule),
        forwardRef(() => TeachersModule),
    ],
    providers: [UsersService],
    exports: [UsersService],
    controllers: [UsersController],
})
export class UsersModule {}
