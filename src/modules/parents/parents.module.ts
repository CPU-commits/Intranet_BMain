import { Module } from '@nestjs/common'
import { ParentController } from './controller/parent/parent.controller'
import { ParentService } from './services/parent/parent.service'
import { UsersModule } from '../users/users.module'
import { HistoryModule } from '../history/history.module'
import { MongooseModule } from '@nestjs/mongoose'
import { Parent, parentSchema } from './entities/parent.entity'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Parent.name, schema: parentSchema },
        ]),
        UsersModule,
        HistoryModule,
    ],
    controllers: [ParentController],
    providers: [ParentService],
    exports: [ParentService],
})
export class ParentsModule {}
