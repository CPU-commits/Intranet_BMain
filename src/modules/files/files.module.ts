import { Module } from '@nestjs/common'
import { ExcelService } from './services/excel/excel.service'
import { FilesController } from './controllers/files/files.controller'

@Module({
    providers: [ExcelService],
    controllers: [FilesController],
})
export class FilesModule {}
