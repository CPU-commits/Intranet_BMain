import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

import { User } from 'src/modules/users/entities/user.entity'
import { Collections } from '../models/collections.model'
import { TypeChange } from '../models/type_change.model'

@Schema()
export class History {
    @Prop({ required: true })
    change: string

    @Prop({
        required: true,
        enum: [
            Collections.COURSE,
            Collections.CYCLE,
            Collections.USER,
            Collections.SUBJECT,
            Collections.SPECIALTY,
            Collections.SEMESTER,
        ],
    })
    collection_name: string

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    who: User | Types.ObjectId

    @Prop({
        required: true,
        enum: [
            TypeChange.ADD,
            TypeChange.DELETE,
            TypeChange.UPDATE,
            TypeChange.DISMISS,
        ],
    })
    type_change: string

    @Prop({ type: String, required: false, maxlength: 535 })
    why: string
}

export const HistorySchema = SchemaFactory.createForClass(History)
