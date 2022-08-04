import { Module } from '@nestjs/common'
import { HistoryModule } from '../history/history.module'
import { UsersModule } from '../users/users.module'
import { LibraryController } from './controller/library.controller'
import { LibraryService } from './service/library.service'

@Module({
    imports: [UsersModule, HistoryModule],
    controllers: [LibraryController],
    providers: [LibraryService],
})
export class LibraryModule {}
