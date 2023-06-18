import { Injectable, UnauthorizedException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Assistance } from '../../entities/assistance.entity'
import { Model } from 'mongoose'
import { PayloadToken } from 'src/auth/models/token.model'
import { CourseService } from 'src/modules/courses/service/course.service'
import { AssistanceDTO } from '../../dtos/assistance.dto'
import { ObjectId } from 'mongodb'
import * as moment from 'moment'

@Injectable()
export class AssistanceService {
    constructor(
        @InjectModel(Assistance.name)
        private readonly assistanceModel: Model<Assistance>,
        private readonly coursesService: CourseService,
    ) {}

    async getAssistancesSection(
        idSection: string,
        {
            limit,
            skip,
            total,
        }: { limit?: number; skip?: number; total: boolean },
    ) {
        const assistances = this.assistanceModel
            .find({
                section: new ObjectId(idSection),
            })
            .sort({ date: -1 })
            .populate('auditor', {
                name: 1,
                first_lastname: 1,
                user_type: 1,
            })
            .populate('assistance.student', {
                name: 1,
                first_lastname: 1,
            })
        if (limit) assistances.limit(limit)
        else assistances.limit(10)

        if (skip) assistances.skip(skip)
        // Total
        let totalData = 0
        if (total)
            totalData = await this.assistanceModel
                .count({
                    section: new ObjectId(idSection),
                })
                .exec()

        return {
            assistances: await assistances.exec(),
            total: totalData,
        }
    }

    async getCurrentAssistanceSection(user: PayloadToken, idSection: string) {
        const hasAccess = await this.coursesService.hasAccessToSection(
            user,
            idSection,
        )
        if (!hasAccess)
            throw new UnauthorizedException('No tienes acceso a esta sección')

        return await this.assistanceModel
            .findOne({
                section: new ObjectId(idSection),
                date: moment().startOf('D').toDate(),
            })
            .populate('auditor', {
                name: 1,
                first_lastname: 1,
                user_type: 1,
            })
            .exec()
    }

    async getSectionsAssistance(
        user: PayloadToken,
        params: { total?: boolean; skip?: number; limit?: number },
    ) {
        const sections = await this.coursesService.getUserSectionsAccess(
            user,
            params,
        )

        return {
            sections: await Promise.all(
                sections.sections.map(async (section) => {
                    const existsAssistance = await this.assistanceModel
                        .exists({
                            date: moment().startOf('D').toDate(),
                            section: new ObjectId(section._id),
                        })
                        .exec()

                    return {
                        ...section.toJSON(),
                        exists_assistance: existsAssistance != null,
                    }
                }),
            ),
            total: sections.total,
        }
    }

    async uploadAssistance(
        assistance: AssistanceDTO,
        idSection: string,
        user: PayloadToken,
    ) {
        const hasAccess = await this.coursesService.hasAccessToSection(
            user,
            idSection,
        )
        if (!hasAccess)
            throw new UnauthorizedException('No tienes acceso a la sección')
        // Insert or update
        const now = moment(assistance.date).startOf('D').toDate()
        const existsAssistance = await this.assistanceModel
            .exists({
                section: new ObjectId(idSection),
                date: now,
            })
            .exec()
        if (existsAssistance) {
            return await this.assistanceModel
                .findByIdAndUpdate(existsAssistance._id, {
                    $set: {
                        assistance: assistance.assistance,
                        auditor: new ObjectId(user._id),
                    },
                })
                .exec()
        }
        const newAssistance = new this.assistanceModel({
            section: new ObjectId(idSection),
            assistance: assistance.assistance.map((student) => ({
                student: new ObjectId(student.student),
                assist: student.assist,
            })),
            auditor: new ObjectId(user._id),
            date: now,
        })
        return await newAssistance.save()
    }
}
