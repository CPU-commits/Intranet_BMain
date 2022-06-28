import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { File } from 'src/modules/aws/entities/file.entity'
import { Teacher } from 'src/modules/teachers/entities/teacher.entity'
import { Course } from './course.entity'

@Schema()
export class CourseLetter {
    @Prop({ required: true })
    section: string

    @Prop({ required: true, type: Types.ObjectId, ref: File.name })
    file: Types.ObjectId | File

    @Prop({ type: Types.ObjectId, ref: 'Teacher' })
    header_teacher: Types.ObjectId | Teacher

    @Prop({ required: true, type: Types.ObjectId, ref: 'Course' })
    course: Types.ObjectId | Course

    @Prop({ default: true })
    status: boolean
}

export const CourseLetterSchema = SchemaFactory.createForClass(CourseLetter)
CourseLetterSchema.index(
    { header_teacher: 1 },
    {
        unique: true,
        partialFilterExpression: { header_teacher: { $type: 'string' } },
    },
)
