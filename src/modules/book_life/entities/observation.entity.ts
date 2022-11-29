import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { Semester } from 'src/modules/semesters/entities/semester.entity'
import { User } from 'src/modules/users/entities/user.entity'

@Schema()
export class Observation {
    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(User) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    student: Types.ObjectId | User

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(Semester) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: Semester.name })
    semester: Types.ObjectId | Semester

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(User) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    author: Types.ObjectId | User

    @ApiProperty({
        description: `false -> Negative.
            true -> Positive`,
    })
    @Prop({ required: true })
    type: boolean

    @ApiProperty({
        example: 'Observation...',
    })
    @Prop({ required: true, maxlength: 500 })
    observation: string

    @ApiProperty({
        example: '2022-08-08T15:32:58.384+00:00',
    })
    @Prop({ required: true })
    date: Date
}

export const ObservationSchema = SchemaFactory.createForClass(Observation)
