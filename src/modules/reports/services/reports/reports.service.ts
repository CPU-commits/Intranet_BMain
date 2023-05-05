import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Report } from '../../entities/report.entity'
import { Model } from 'mongoose'
import { ReportDTO } from '../../dtos/report.dto'
import { ObjectId } from 'mongodb'

@Injectable()
export class ReportsService {
    constructor(
        @InjectModel(Report.name) private readonly reportModel: Model<Report>,
    ) {}

    async uploadReport(report: ReportDTO, idUser: string) {
        const newReport = new this.reportModel({
            description: report.report.description,
            type: report.report.type,
            user: new ObjectId(idUser),
            error: report.error,
        })

        return await newReport.save()
    }
}
