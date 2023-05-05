import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common'
import { Request, Response } from 'express'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { PayloadToken } from 'src/auth/models/token.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { ReportsService } from '../../services/reports/reports.service'
import { ReportDTO } from '../../dtos/report.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/reports')
export class ReportsController {
    constructor(private readonly reportService: ReportsService) {}

    @Post('/')
    async uploadReport(
        @Res() res: Response,
        @Req() req: Request,
        @Body() report: ReportDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.reportService.uploadReport(report, user._id)

            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
