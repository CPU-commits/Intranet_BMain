import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Observation, ObservationSchema } from './entities/observation.entity'
import { BookLifeController } from './controller/book_life.controller'
import { BookLifeService } from './service/book_life.service'
import { UsersModule } from '../users/users.module'
import { SemestersModule } from '../semesters/semesters.module'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Observation.name,
                schema: ObservationSchema,
            },
        ]),
        UsersModule,
        SemestersModule,
    ],
    controllers: [BookLifeController],
    providers: [BookLifeService],
})
export class BookLifeModule {}
