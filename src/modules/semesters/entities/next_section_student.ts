import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { CourseLetter } from 'src/modules/courses/entities/course_letter.entity'
import { User } from 'src/modules/users/entities/user.entity'

@Schema({ collection: 'next_section_students' })
export class NextSectionStudent {
    @Prop({ type: Types.ObjectId, ref: CourseLetter.name })
    section: Types.ObjectId | CourseLetter

    @Prop({ type: Types.ObjectId, ref: User.name })
    student: Types.ObjectId | User
}

export const NextSectionStudentSchema =
    SchemaFactory.createForClass(NextSectionStudent)
