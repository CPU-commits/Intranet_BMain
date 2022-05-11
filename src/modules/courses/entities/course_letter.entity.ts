import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { User } from 'src/modules/users/entities/user.entity'
import { Course } from './course.entity'

@Schema()
export class CourseLetter {
    @Prop({ required: true })
    section: string

    @Prop({ type: Types.ObjectId, ref: User.name })
    header_teacher: Types.ObjectId | User

    @Prop({ required: true, type: Types.ObjectId, ref: 'Course' })
    course: Types.ObjectId | Course
}

export const CourseLetterSchema = SchemaFactory.createForClass(CourseLetter)
CourseLetterSchema.index(
    { header_teacher: 1 },
    {
        unique: true,
        partialFilterExpression: { header_teacher: { $type: 'string' } },
    },
)
