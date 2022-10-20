import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { TypeChange } from '../../models/type_change.model'
import { HistoryService } from '../../service/history.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService) {}

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_history')
    async getHistory(
        @Res() res: Response,
        @Query('limit') limit: number,
        @Query('skip') skip: number,
        @Query('semester') semester: string,
        @Query('total') total: boolean,
        @Query('change') change: keyof typeof TypeChange,
        @Query('person') person: string,
        @Query('specific_date') specificDate: string,
        @Query('date_start') dateStart: string,
        @Query('date_finish') dateFinish: string,
    ) {
        try {
            const history = await this.historyService.getHistory(
                total,
                skip,
                limit,
                semester,
                change,
                person,
                specificDate,
                dateStart,
                dateFinish,
            )
            handleRes(res, {
                history,
            })
        } catch (err) {
            handleError(err, res)
        }
    }
}
