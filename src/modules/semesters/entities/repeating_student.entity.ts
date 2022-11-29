import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { User } from 'src/modules/users/entities/user.entity'
import { Semester } from './semester.entity'

@Schema()
export class RepeatingStudent {
    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(Semester) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: Semester.name })
    semester: Types.ObjectId | Semester

    @ApiProperty({
        oneOf: [
            { type: 'array', items: { type: 'string' } },
            { type: 'array', items: { $ref: getSchemaPath(User) } },
        ],
    })
    @Prop({
        required: true,
        type: [{ type: Types.ObjectId, ref: User.name }],
    })
    students: Types.Array<Types.ObjectId> | User[]

    @ApiProperty({ example: '2022-08-08T15:32:58.384+00:00' })
    @Prop({ required: true })
    date: Date
}

export const RepeatingStudentSchema =
    SchemaFactory.createForClass(RepeatingStudent)
