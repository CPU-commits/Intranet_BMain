import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { User } from 'src/modules/users/entities/user.entity'

@Schema()
export class Cycle {
    @ApiProperty({
        example: '1st',
    })
    @Prop({ required: true })
    cycle: string

    @ApiProperty({
        oneOf: [
            { type: 'array', items: { type: 'string' } },
            { type: 'array', items: { $ref: getSchemaPath(User) } },
        ],
    })
    @Prop({ type: [Types.ObjectId], ref: User.name })
    members: Types.Array<Types.ObjectId> | User[]
}

export const CycleSchema = SchemaFactory.createForClass(Cycle)
