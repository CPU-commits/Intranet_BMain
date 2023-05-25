import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { User } from 'src/modules/users/entities/user.entity'

@Schema()
export class Parent {
    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(User) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    user: Types.ObjectId | User

    @ApiProperty({
        type: 'array',
        items: {
            oneOf: [{ type: 'string' }, { $ref: getSchemaPath(User) }],
        },
    })
    @Prop({ required: false, type: [{ type: Types.ObjectId, ref: User.name }] })
    students: Array<Types.ObjectId | User>
}

export const parentSchema = SchemaFactory.createForClass(Parent)
