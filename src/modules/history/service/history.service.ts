import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import * as moment from 'moment'
import { FilterQuery, Model } from 'mongoose'
import { Semester } from 'src/modules/semesters/entities/semester.entity'

import { History } from '../entities/history.entity'
import { TypeChange, TypeChangeKey } from '../models/type_change.model'

@Injectable()
export class HistoryService {
    constructor(
        @InjectModel(History.name) private historyModel: Model<History>,
        @InjectModel(Semester.name) private semesterModel: Model<Semester>,
    ) {}

    async getHistory(
        total = false,
        skip = 0,
        limit = 25,
        semester?: string,
        change?: keyof typeof TypeChange,
        person?: string,
        specificDate?: string,
        dateStart?: string,
        dateFinish?: string,
    ) {
        const filter: FilterQuery<History> = {}
        if (semester) filter.semester = semester
        if (change) filter.type_change = change
        if (person) filter.who = person
        if (specificDate) {
            filter.$and = [
                {
                    date: {
                        $gte: moment(specificDate).startOf('D').toDate(),
                    },
                },
                {
                    date: {
                        $lte: moment(specificDate).endOf('D').toDate(),
                    },
                },
            ]
        } else if (dateStart && dateFinish) {
            filter.$and = [
                {
                    date: {
                        $gte: new Date(dateStart),
                    },
                },
                {
                    date: {
                        $lte: new Date(dateFinish),
                    },
                },
            ]
        }
        const history = this.historyModel
            .find(filter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate('who', { name: 1, first_lastname: 1, rut: 1 })
        let totalData: number
        if (total) totalData = await this.historyModel.count(filter).exec()
        return {
            history: await history.exec(),
            total: totalData,
        }
    }

    async getPersons() {
        const persons: Array<string> = await this.historyModel.distinct('who')
        return persons
    }

    async insertChange(
        change: string,
        collection_name: string,
        who: string,
        type_change: keyof typeof TypeChangeKey,
        why?: string,
    ) {
        const semester = await this.semesterModel.findOne({ status: 2 }).exec()
        const now = new Date()
        const newChange = new this.historyModel({
            change,
            collection_name,
            who,
            type_change,
            why,
            date: now,
            semester: semester ? semester._id.toString() : undefined,
        })
        return await newChange.save()
    }
}
