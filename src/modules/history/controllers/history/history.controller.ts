import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common'
import {
    ApiExtraModels,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiServiceUnavailableResponse,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger'
import { Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { ResApi } from 'src/models/res.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { TypeChange } from '../../models/type_change.model'
import { HistoryRes } from '../../res/history.res'
import { HistoryService } from '../../service/history.service'

@ApiTags('Main', 'History', 'roles.director', 'roles.directive')
@ApiServiceUnavailableResponse({
    description: 'MongoDB || Nats service unavailable',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService) {}

    @ApiExtraModels(HistoryRes)
    @ApiOperation({
        description: 'Get history actions',
        summary: 'Get history actions',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
    })
    @ApiQuery({
        name: 'skip',
        required: false,
    })
    @ApiQuery({
        name: 'semester',
        required: false,
    })
    @ApiQuery({
        name: 'total',
        required: false,
    })
    @ApiQuery({
        name: 'change',
        required: false,
    })
    @ApiQuery({
        name: 'person',
        required: false,
    })
    @ApiQuery({
        name: 'specific_date',
        required: false,
    })
    @ApiQuery({
        name: 'date_start',
        required: false,
    })
    @ApiQuery({
        name: 'date_finish',
        required: false,
    })
    @ApiResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(HistoryRes),
                        },
                    },
                },
            ],
        },
    })
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
