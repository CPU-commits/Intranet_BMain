import { Module } from '@nestjs/common'

import { HistoryModule } from '../history/history.module'
import { UsersModule } from '../users/users.module'
import { DirectiveService } from './services/directive.service'
import { DirectiveController } from './controller/directive.controller'

@Module({
    imports: [HistoryModule, UsersModule],
    controllers: [DirectiveController],
    providers: [DirectiveService],
})
export class DirectiveModule {}
