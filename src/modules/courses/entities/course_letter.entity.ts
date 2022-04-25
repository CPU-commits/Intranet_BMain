import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { Subject } from 'src/modules/subjects/entities/subject.entity'
import { Course } from './course.entity'

@Schema()
export class CourseLetter {
    @Prop({ required: true })
    section: string

    @Prop({ required: true, type: Types.ObjectId, ref: 'Course' })
    course: Types.ObjectId | Course

    @Prop({ type: [Types.ObjectId], ref: Subject.name })
    subjects: Types.Array<Types.ObjectId> | Subject[]
}

export const CourseLetterSchema = SchemaFactory.createForClass(CourseLetter)
