import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { History } from '../entities/history.entity'
import { TypeChangeKey } from '../models/type_change.model'

@Injectable()
export class HistoryService {
    constructor(
        @InjectModel(History.name) private historyModel: Model<History>,
    ) {}

    async insertChange(
        change: string,
        collection_name: string,
        who: string,
        type_change: keyof typeof TypeChangeKey,
    ) {
        const newChange = new this.historyModel({
            change,
            collection_name,
            who,
            type_change,
        })
        return await newChange.save()
    }
}
