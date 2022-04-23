import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { HistorySchema, History } from './entities/history.entity'
import { HistoryService } from './service/history.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: History.name,
                schema: HistorySchema,
            },
        ]),
    ],
    providers: [HistoryService],
    exports: [HistoryService],
})
export class HistoryModule {}
