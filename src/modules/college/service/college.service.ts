import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CollegeDTO } from '../dtos/college.dto'
import { KeyValue } from '../entities/key_value.entity'
import { CollegeKeys } from '../models/college.model'

@Injectable()
export class CollegeService {
    constructor(
        @InjectModel(KeyValue.name) private keyValueModel: Model<KeyValue>,
    ) {}

    async getCollegeData() {
        const college: any = {}
        const collegeData = await Promise.all([
            this.keyValueModel.findOne({ key: CollegeKeys.DIRECTION }).exec(),
            this.keyValueModel.findOne({ key: CollegeKeys.EMAIL }).exec(),
            this.keyValueModel.findOne({ key: CollegeKeys.PHONE }).exec(),
        ])
        if (!collegeData[0]) return college
        college[CollegeKeys.DIRECTION] = collegeData[0].value
        college[CollegeKeys.EMAIL] = collegeData[1].value
        college[CollegeKeys.PHONE] = collegeData[2].value
        return college
    }

    async updateCollegeData(college: CollegeDTO) {
        const direction = await this.keyValueModel
            .findOne({
                key: CollegeKeys.DIRECTION,
            })
            .exec()
        if (direction) {
            return await Promise.all([
                this.keyValueModel
                    .updateOne(
                        {
                            key: CollegeKeys.DIRECTION,
                        },
                        { $set: { value: college.direction } },
                        { new: true },
                    )
                    .exec(),
                this.keyValueModel
                    .updateOne(
                        {
                            key: CollegeKeys.EMAIL,
                        },
                        { $set: { value: college.email } },
                        { new: true },
                    )
                    .exec(),
                this.keyValueModel
                    .updateOne(
                        {
                            key: CollegeKeys.PHONE,
                        },
                        { $set: { value: college.phone } },
                        { new: true },
                    )
                    .exec(),
            ])
        } else {
            return await this.keyValueModel.insertMany([
                {
                    key: CollegeKeys.DIRECTION,
                    value: college.direction,
                },
                {
                    key: CollegeKeys.EMAIL,
                    value: college.email,
                },
                {
                    key: CollegeKeys.PHONE,
                    value: college.phone,
                },
            ])
        }
    }
}
