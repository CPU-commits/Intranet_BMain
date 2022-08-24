import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { User } from 'src/modules/users/entities/user.entity'

@Schema()
export class Vote {
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    user: Types.ObjectId

    @Prop({ required: true, type: Types.ObjectId })
    list: Types.ObjectId

    @Prop({ required: true })
    date: Date
}

export const VoteSchema = SchemaFactory.createForClass(Vote)
