import { Module } from '@nestjs/common'
import { ReportsController } from './controllers/reports/reports.controller'
import { ReportsService } from './services/reports/reports.service'
import { MongooseModule } from '@nestjs/mongoose'
import { Report, SchemaReport } from './entities/report.entity'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Report.name, schema: SchemaReport },
        ]),
    ],
    controllers: [ReportsController],
    providers: [ReportsService],
})
export class ReportsModule {}
