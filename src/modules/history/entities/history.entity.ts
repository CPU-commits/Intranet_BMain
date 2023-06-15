import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { Semester } from 'src/modules/semesters/entities/semester.entity'

import { User } from 'src/modules/users/entities/user.entity'
import { Collections } from '../models/collections.model'
import { TypeChange } from '../models/type_change.model'

@Schema()
export class History {
    @ApiProperty({
        example: 'Desc of change',
    })
    @Prop({ required: true })
    change: string

    @ApiProperty({
        example: 'course',
        enum: [
            Collections.COURSE,
            Collections.CYCLE,
            Collections.USER,
            Collections.SUBJECT,
            Collections.SPECIALTY,
            Collections.SEMESTER,
            Collections.VOTING,
        ],
    })
    @Prop({
        required: true,
        enum: [
            Collections.COURSE,
            Collections.CYCLE,
            Collections.USER,
            Collections.SUBJECT,
            Collections.SPECIALTY,
            Collections.SEMESTER,
            Collections.VOTING,
        ],
    })
    collection_name: string

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(User) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    who: User | Types.ObjectId

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(User) }],
    })
    @Prop({ type: Types.ObjectId, ref: User.name })
    affected: User | Types.ObjectId

    @ApiProperty({
        example: 'add',
        enum: [
            TypeChange.ADD,
            TypeChange.DELETE,
            TypeChange.UPDATE,
            TypeChange.DISMISS,
            TypeChange.REINTEGRATE,
            TypeChange.CLOSE,
        ],
    })
    @Prop({
        required: true,
        enum: [
            TypeChange.ADD,
            TypeChange.DELETE,
            TypeChange.UPDATE,
            TypeChange.DISMISS,
            TypeChange.REINTEGRATE,
            TypeChange.CLOSE,
        ],
    })
    type_change: string

    @ApiProperty({ example: 'Because...' })
    @Prop({ type: String, required: false, maxlength: 535 })
    why: string

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(Semester) }],
    })
    @Prop({ type: Types.ObjectId, ref: Semester.name })
    semester?: Types.ObjectId | Semester

    @ApiProperty({ example: '2022-08-08T15:32:58.384+00:00' })
    @Prop({ type: Date, required: true })
    date: Date
}

export const HistorySchema = SchemaFactory.createForClass(History)
