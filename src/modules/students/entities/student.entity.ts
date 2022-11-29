import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'
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
}

export const StudentSchema = SchemaFactory.createForClass(Student)
