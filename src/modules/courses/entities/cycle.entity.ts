import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { User } from 'src/modules/users/entities/user.entity'

@Schema()
export class Cycle {
    @Prop({ required: true })
    cycle: string

    @Prop({ type: [Types.ObjectId], ref: User.name })
    members: Types.Array<Types.ObjectId> | User[]
}

export const CycleSchema = SchemaFactory.createForClass(Cycle)
