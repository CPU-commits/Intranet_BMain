import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { User } from 'src/modules/users/entities/user.entity'

@Schema()
export class Vote {
    @ApiProperty({ type: 'string' })
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    user: Types.ObjectId

    @ApiProperty({ type: 'string' })
    @Prop({ required: true, type: Types.ObjectId })
    list: Types.ObjectId

    @ApiProperty({ example: '2022-08-08T15:32:58.384+00:00' })
    @Prop({ required: true })
    date: Date
}

export const VoteSchema = SchemaFactory.createForClass(Vote)
