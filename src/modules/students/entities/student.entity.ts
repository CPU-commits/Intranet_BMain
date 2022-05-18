import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { CourseLetter } from 'src/modules/courses/entities/course_letter.entity'
import { User } from 'src/modules/users/entities/user.entity'

@Schema()
export class Student {
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    user: Types.ObjectId | User

    @Prop({ type: Types.ObjectId, ref: CourseLetter.name })
    course: Types.ObjectId | CourseLetter

    @Prop({ required: true })
    registration_number: string
}

export const StudentSchema = SchemaFactory.createForClass(Student)
