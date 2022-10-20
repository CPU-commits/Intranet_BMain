import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { HistorySchema, History } from './entities/history.entity'
import { HistoryService } from './service/history.service'
import { HistoryController } from './controllers/history/history.controller'
import { Semester, SemesterSchema } from '../semesters/entities/semester.entity'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: History.name,
                schema: HistorySchema,
            },
            {
                name: Semester.name,
                schema: SemesterSchema,
            },
        ]),
    ],
    providers: [HistoryService],
    exports: [HistoryService],
    controllers: [HistoryController],
})
export class HistoryModule {}
