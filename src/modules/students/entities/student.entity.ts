import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { Address } from 'src/modules/college/entities/address.entity'
import { CourseLetter } from 'src/modules/courses/entities/course_letter.entity'
import { User } from 'src/modules/users/entities/user.entity'

@Schema()
export class Student {
    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(User) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    user: Types.ObjectId | User

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(CourseLetter) }],
    })
    @Prop({ type: Types.ObjectId, ref: CourseLetter.name })
    course: Types.ObjectId | CourseLetter

    @ApiProperty({
        example: 'KmMds14q',
    })
    @Prop({ required: true })
    registration_number: string

    @ApiProperty({
        example: 'h',
        enum: ['h', 'm'],
    })
    @Prop({ required: true, enum: ['h', 'm'] })
    gender: string

    @ApiProperty({
        example: '2022-08-08T15:32:58.384+00:00',
    })
    @Prop({ required: true, type: Date })
    birthday: Date

    @ApiProperty()
    @Prop({ required: true, type: Types.ObjectId, ref: Address.name })
    address: Types.ObjectId | Address
}

export const StudentSchema = SchemaFactory.createForClass(Student)
